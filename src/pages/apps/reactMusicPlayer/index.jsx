import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// LocalStorage key for player prefs
const LS_STATE = "musicPlayer.state";

const initialState = {
    volume: 0.9,
    mute: false,
    shuffle: false,
    repeat: "off", // "off" | "all" | "one"
    currentIndex: -1,
};

export default function ReactMusicPlayer() {
    const [playlist, setPlaylist] = useState([]); // {id, title, src, isBlob}
    const [ui, setUi] = useState(initialState);
    const [progress, setProgress] = useState({ current: 0, duration: 0 });
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: "" });

    const audioRef = useRef(null);
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    const idRef = useRef(1);

    // Restore player prefs
    useEffect(() => {
        try {
            const rawState = localStorage.getItem(LS_STATE);
            if (rawState) {
                const s = JSON.parse(rawState);
                setUi((p) => ({ ...p, ...s, currentIndex: -1 })); // index is session-scoped
            }
        } catch { }
    }, []);

    // Persist prefs (without currentIndex)
    useEffect(() => {
        const { volume, mute, shuffle, repeat } = ui;
        localStorage.setItem(LS_STATE, JSON.stringify({ volume, mute, shuffle, repeat }));
    }, [ui.volume, ui.mute, ui.shuffle, ui.repeat]);

    // Wire audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTime = () => setProgress((p) => ({ ...p, current: audio.currentTime || 0 }));
        const onLoaded = () =>
            setProgress({ current: 0, duration: isFinite(audio.duration) ? audio.duration : 0 });
        const onEnded = handleEnded;

        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);
        return () => {
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
        };
    }, [playlist, ui.repeat, ui.shuffle, ui.currentIndex]);

    // Reflect volume/mute on element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = ui.mute ? 0 : ui.volume;
    }, [ui.volume, ui.mute]);

    // Drag & drop support (left panel)
    useEffect(() => {
        const el = dropRef.current;
        if (!el) return;

        const prevent = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        const onDrop = (e) => {
            prevent(e);
            const files = Array.from(e.dataTransfer.files || []).filter((f) =>
                /^audio\//.test(f.type)
            );
            if (files.length) addFiles(files);
        };

        el.addEventListener("dragenter", prevent);
        el.addEventListener("dragover", prevent);
        el.addEventListener("dragleave", prevent);
        el.addEventListener("drop", onDrop);
        return () => {
            el.removeEventListener("dragenter", prevent);
            el.removeEventListener("dragover", prevent);
            el.removeEventListener("dragleave", prevent);
            el.removeEventListener("drop", onDrop);
        };
    }, []);

    const currentTrack = useMemo(() => playlist[ui.currentIndex] || null, [playlist, ui.currentIndex]);

    function addFiles(files) {
        const next = files.map((f) => ({
            id: ++idRef.current,
            title: f.name.replace(/\.[^.]+$/, ""),
            src: URL.createObjectURL(f),
            isBlob: true,
        }));
        setPlaylist((prev) => {
            const out = [...prev, ...next];
            if (ui.currentIndex === -1 && out.length) {
                setUi((u) => ({ ...u, currentIndex: 0 }));
                setTimeout(() => playIndex(0, true), 0);
            }
            return out;
        });
    }

    function playIndex(idx, forcePlay = false) {
        if (idx < 0 || idx >= playlist.length) return;
        setUi((u) => ({ ...u, currentIndex: idx }));
        setTimeout(() => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.src = playlist[idx].src;
            audio.play().catch(() => { });
        }, 0);
    }

    function togglePlay() {
        const audio = audioRef.current;
        if (!audio) return;
        if (!currentTrack) {
            if (playlist.length) playIndex(0, true);
            return;
        }
        if (audio.paused) audio.play().catch(() => { });
        else audio.pause();
    }

    function nextTrack(manual = false) {
        if (!playlist.length) return;
        if (ui.shuffle) {
            if (playlist.length === 1) return playIndex(0, true);
            let r = Math.floor(Math.random() * playlist.length);
            if (r === ui.currentIndex) r = (r + 1) % playlist.length;
            playIndex(r, true);
            return;
        }
        const last = playlist.length - 1;
        if (ui.currentIndex < last) playIndex(ui.currentIndex + 1, true);
        else if (ui.repeat === "all" || manual) playIndex(0, true);
    }

    function prevTrack() {
        if (!playlist.length) return;
        if (ui.shuffle) return nextTrack(true);
        if (ui.currentIndex > 0) playIndex(ui.currentIndex - 1, true);
        else playIndex(playlist.length - 1, true);
    }

    function handleEnded() {
        if (ui.repeat === "one") {
            const a = audioRef.current;
            if (a) { a.currentTime = 0; a.play().catch(() => { }); }
            return;
        }
        nextTrack();
    }

    // Actual delete (revoke blob if needed)
    function removeTrack(id) {
        setPlaylist((prev) => {
            const idx = prev.findIndex((t) => t.id === id);
            const removed = prev[idx];
            if (removed && String(removed.src).startsWith("blob:")) {
                try { URL.revokeObjectURL(removed.src); } catch { }
            }
            const out = prev.filter((t) => t.id !== id);
            if (idx === ui.currentIndex) {
                if (!out.length) {
                    setUi((u) => ({ ...u, currentIndex: -1 }));
                    const a = audioRef.current; if (a) { a.pause(); a.src = ""; }
                    setProgress({ current: 0, duration: 0 });
                } else {
                    const nextIdx = Math.min(idx, out.length - 1);
                    setUi((u) => ({ ...u, currentIndex: nextIdx }));
                    setTimeout(() => playIndex(nextIdx, false), 0);
                }
            } else if (idx < ui.currentIndex) {
                setUi((u) => ({ ...u, currentIndex: u.currentIndex - 1 }));
            }
            return out;
        });
    }

    function clearAll() {
        playlist.forEach((t) => {
            if (String(t.src).startsWith("blob:")) {
                try { URL.revokeObjectURL(t.src); } catch { }
            }
        });
        setPlaylist([]);
        setUi((u) => ({ ...u, currentIndex: -1 }));
        const a = audioRef.current; if (a) { a.pause(); a.src = ""; }
        setProgress({ current: 0, duration: 0 });
    }

    function onSeek(e) {
        const a = audioRef.current;
        if (!a) return;
        const v = Number(e.target.value);
        a.currentTime = v;
        setProgress((p) => ({ ...p, current: v }));
    }

    function setVolume(v) { setUi((u) => ({ ...u, volume: v })); }
    function toggleMute() { setUi((u) => ({ ...u, mute: !u.mute })); }
    function toggleShuffle() { setUi((u) => ({ ...u, shuffle: !u.shuffle })); }
    function cycleRepeat() {
        setUi((u) => ({ ...u, repeat: u.repeat === "off" ? "all" : u.repeat === "all" ? "one" : "off" }));
    }

    function fmt(t) {
        const s = Math.max(0, Math.floor(t || 0));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return m + ":" + String(r).padStart(2, "0");
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">React Music Player</div>
                <div className="row">
                    <label className="fileBtn">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="audio/*"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length) addFiles(files);
                                e.target.value = "";
                            }}
                        />
                        Add Files
                    </label>

                    <button onClick={() => setShowClearConfirm(true)} disabled={!playlist.length}>
                        Clear All
                    </button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Left ref={dropRef}>
                    <Styled.NowPlaying>
                        <div className="meta">
                            <div className="art" aria-hidden>♪</div>
                            <div className="texts">
                                <div className="title">{currentTrack ? currentTrack.title : "Nothing playing"}</div>
                                <div className="sub">
                                    {currentTrack ? (currentTrack.isBlob ? "Local file" : currentTrack.src) : "Drop audio here or add files"}
                                </div>
                            </div>
                        </div>

                        <audio ref={audioRef} preload="metadata" />

                        <div className="controls">
                            <button onClick={prevTrack} title="Previous">⏮</button>
                            <button onClick={togglePlay} title="Play/Pause">⏯</button>
                            <button onClick={() => nextTrack(true)} title="Next">⏭</button>

                            <div className="spacer" />

                            <button className={ui.shuffle ? "active" : ""} onClick={toggleShuffle} title="Shuffle">🔀</button>
                            <button className={ui.repeat !== "off" ? "active" : ""} onClick={cycleRepeat} title={`Repeat: ${ui.repeat}`}>
                                {ui.repeat === "one" ? "🔁1" : "🔁"}
                            </button>
                        </div>

                        <div className="seek">
                            <div className="time">{fmt(progress.current)}</div>
                            <input
                                type="range"
                                min="0"
                                max={progress.duration || 0}
                                step="0.1"
                                value={Math.min(progress.current, progress.duration || 0)}
                                onChange={onSeek}
                            />
                            <div className="time">{fmt(progress.duration)}</div>
                        </div>

                        <div className="volume">
                            <button onClick={toggleMute} title="Mute/Unmute">{ui.mute ? "🔇" : "🔊"}</button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={ui.mute ? 0 : ui.volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                            />
                        </div>
                    </Styled.NowPlaying>
                </Styled.Left>

                <Styled.Right>
                    <Styled.Playlist>
                        {playlist.length === 0 && <div className="empty">No tracks yet.</div>}
                        {playlist.map((t, i) => (
                            <li key={t.id} className={i === ui.currentIndex ? "active" : ""}>
                                <button className="title" onClick={() => playIndex(i, true)}>
                                    <span className="idx">{i + 1}.</span> {t.title}
                                </button>
                                <div className="ops">
                                    <button onClick={() => moveUp(t.id)} title="Move up">↑</button>
                                    <button onClick={() => moveDown(t.id)} title="Move down">↓</button>
                                    <button
                                        onClick={() => setDeleteConfirm({ open: true, id: t.id, title: t.title })}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </li>
                        ))}
                    </Styled.Playlist>
                    <Styled.Tips>
                        <div>Tip: Local files are session-only (not persisted).</div>
                        <div>Drop audio files anywhere in the left panel.</div>
                    </Styled.Tips>
                </Styled.Right>
            </Styled.Body>

            {/* Clear All Confirm */}
            {showClearConfirm && (
                <Styled.ModalBackdrop onClick={() => setShowClearConfirm(false)}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Clear all tracks?</div>
                        <div className="msg">This removes the entire playlist (blob URLs are revoked). This can’t be undone.</div>
                        <div className="row">
                            <button className="ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                            <button
                                className="danger"
                                onClick={() => {
                                    clearAll();
                                    setShowClearConfirm(false);
                                }}
                            >
                                Yes, Clear
                            </button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}

            {/* Delete Single Track Confirm */}
            {deleteConfirm.open && (
                <Styled.ModalBackdrop onClick={() => setDeleteConfirm({ open: false, id: null, title: "" })}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Remove this track?</div>
                        <div className="msg">
                            <b>{deleteConfirm.title}</b> will be removed from the playlist. This can’t be undone.
                        </div>
                        <div className="row">
                            <button
                                className="ghost"
                                onClick={() => setDeleteConfirm({ open: false, id: null, title: "" })}
                            >
                                Cancel
                            </button>
                            <button
                                className="danger"
                                onClick={() => {
                                    removeTrack(deleteConfirm.id);
                                    setDeleteConfirm({ open: false, id: null, title: "" });
                                }}
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}
