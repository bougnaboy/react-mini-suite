import React, { useEffect, useState } from "react";
import { Styled } from "./styled";

const initial = {
    ipv4: null,
    ipv6: null,
    isp: null,
    asn: null,
    org: null,
    country: null,
    region: null,
    city: null,
    postal: null,
    latitude: null,
    longitude: null,
    timezone: null,
    utc_offset: null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    connection:
        typeof navigator !== "undefined" && "connection" in navigator
            ? navigator.connection?.effectiveType || null
            : null,
    locationSource: "IP", // "IP" | "Device"
};

export default function IpInfo() {
    const [info, setInfo] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [lastCopied, setLastCopied] = useState("");

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadAll() {
        setLoading(true);
        setLastCopied("");
        try {
            const [v4, v6] = await Promise.all([getIPv4(), getIPv6()]);
            const geo = await getGeo();
            setInfo((prev) => ({
                ...prev,
                ipv4: v4 || prev.ipv4,
                ipv6: v6 || prev.ipv6,
                ...geo,
                locationSource: "IP",
            }));
        } finally {
            setLoading(false);
        }
    }

    // ---------- Fetch helpers ----------
    async function withTimeout(promiseFn, ms = 6000) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        try {
            const res = await promiseFn(ctrl.signal);
            clearTimeout(t);
            return res;
        } catch {
            clearTimeout(t);
            return null;
        }
    }

    async function getIPv4() {
        const r1 = await withTimeout((signal) =>
            fetch("https://api.ipify.org?format=json", { signal })
        );
        if (r1?.ok) return (await r1.json()).ip || null;

        const r2 = await withTimeout((signal) =>
            fetch("https://ifconfig.co/json", { signal })
        );
        if (r2?.ok) return (await r2.json()).ip || null;

        return null;
    }

    async function getIPv6() {
        const r1 = await withTimeout((signal) =>
            fetch("https://api64.ipify.org?format=json", { signal })
        );
        if (r1?.ok) {
            const j = await r1.json();
            return j.ip && j.ip.includes(":") ? j.ip : null;
        }
        const r2 = await withTimeout((signal) =>
            fetch("https://ifconfig.co/json", { signal })
        );
        if (r2?.ok) {
            const j = await r2.json();
            return j.ip && j.ip.includes(":") ? j.ip : null;
        }
        return null;
    }

    async function getGeo() {
        // Primary: ipapi
        let r = await withTimeout((signal) => fetch("https://ipapi.co/json/", { signal }));
        if (r?.ok) {
            const j = await r.json();
            return {
                isp: j.org || null,
                asn: j.asn || null,
                org: j.org || null,
                country: j.country_name || j.country || null,
                region: j.region || null,
                city: j.city || null,
                postal: j.postal || null,
                latitude: j.latitude ?? j.lat ?? null,
                longitude: j.longitude ?? j.lon ?? null,
                timezone: j.timezone || null,
                utc_offset: j.utc_offset || null,
            };
        }
        // Fallback: ipwho.is
        r = await withTimeout((signal) => fetch("https://ipwho.is/", { signal }));
        if (r?.ok) {
            const j = await r.json();
            return {
                isp: j.connection?.isp || j.connection?.org || null,
                asn: j.connection?.asn || null,
                org: j.connection?.org || null,
                country: j.country || null,
                region: j.region || null,
                city: j.city || null,
                postal: j.postal || null,
                latitude: j.latitude ?? null,
                longitude: j.longitude ?? null,
                timezone: j.timezone?.id || null,
                utc_offset: j.timezone?.utc || null,
            };
        }
        return {};
    }

    // ---------- Device location (precise) ----------
    async function useDeviceLocation() {
        if (!("geolocation" in navigator)) return;
        setLocating(true);
        setLastCopied("");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const rev = await reverseGeocode(latitude, longitude);
                setInfo((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    city: rev?.city || rev?.locality || prev.city,
                    region: rev?.principalSubdivision || prev.region,
                    country: rev?.countryName || prev.country,
                    timezone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone || prev.timezone,
                    utc_offset: getOffsetString(),
                    locationSource: "Device",
                }));
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    async function reverseGeocode(lat, lon) {
        // Free, CORS-enabled reverse geocoder
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        try {
            const r = await withTimeout((signal) => fetch(url, { signal }), 8000);
            if (r?.ok) return await r.json();
        } catch { }
        return null;
    }

    function getOffsetString(d = new Date()) {
        const offMin = -d.getTimezoneOffset();
        const sign = offMin >= 0 ? "+" : "-";
        const hh = String(Math.floor(Math.abs(offMin) / 60)).padStart(2, "0");
        const mm = String(Math.abs(offMin) % 60).padStart(2, "0");
        return `${sign}${hh}:${mm}`;
    }

    // ---------- Actions ----------
    async function copy(text, key) {
        try {
            await navigator.clipboard.writeText(text);
            setLastCopied(key);
            setTimeout(() => setLastCopied(""), 1200);
        } catch { }
    }

    function copyAllAsJson() {
        const payload = JSON.stringify(info, null, 2);
        copy(payload, "json");
    }

    function handlePrint() {
        // Print ONLY the info card via hidden iframe
        const values = collectPrintable(info);
        const iframe = document.createElement("iframe");
        Object.assign(iframe.style, {
            position: "fixed",
            right: "0",
            bottom: "0",
            width: "0",
            height: "0",
            border: "0",
        });
        document.body.appendChild(iframe);

        const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<title>IP Info</title>
<style>
@page{margin:16px}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111}
.card{max-width:720px;margin:0 auto;border:1px solid #ddd;border-radius:12px;padding:16px}
h1{font-size:18px;margin:0 0 10px}
.grid{display:grid;grid-template-columns:180px 1fr;gap:6px 12px}
.k{color:#555}.v{color:#111;word-break:break-all}
.muted{color:#777;font-size:12px;margin-top:10px}
</style></head>
<body>
<div class="card">
<h1>IP Info</h1>
<div class="grid">
${values
                .map(
                    ([k, v]) => `<div class="k">${k}</div><div class="v">${v ?? "—"}</div>`
                )
                .join("")}
</div>
<div class="muted">Location source: ${info.locationSource}</div>
</div>
<script>onload=()=>{print();setTimeout(()=>close(),300)}</script>
</body></html>`;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open(); doc.write(html); doc.close();
    }

    function collectPrintable(d) {
        const map = d.latitude != null && d.longitude != null
            ? `https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=12/${d.latitude}/${d.longitude}`
            : null;
        return [
            ["IPv4", safe(d.ipv4)],
            ["IPv6", safe(d.ipv6)],
            ["ISP / Org", safe(d.isp || d.org)],
            ["ASN", safe(d.asn)],
            ["Country", safe(d.country)],
            ["Region/State", safe(d.region)],
            ["City", safe(d.city)],
            ["Postal", safe(d.postal)],
            ["Latitude", d.latitude ?? "—"],
            ["Longitude", d.longitude ?? "—"],
            ["Map", map ? map : "—"],
            ["Timezone", safe(d.timezone)],
            ["UTC Offset", safe(d.utc_offset)],
            ["Device (UA)", safe(d.userAgent)],
            ["Connection", safe(d.connection)],
        ];
    }

    function safe(v) {
        if (v === null || v === undefined || v === "") return "—";
        return String(v);
    }

    // ---------- UI ----------
    const mapHref =
        info.latitude != null && info.longitude != null
            ? `https://www.openstreetmap.org/?mlat=${info.latitude}&mlon=${info.longitude}#map=12/${info.latitude}/${info.longitude}`
            : null;

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">IP Info</div>
                <div className="actions">
                    <button onClick={loadAll} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                    <button onClick={useDeviceLocation} disabled={locating}>
                        {locating ? "Locating…" : "Use Precise Location"}
                    </button>
                    <button onClick={copyAllAsJson}>
                        {lastCopied === "json" ? "Copied!" : "Copy JSON"}
                    </button>
                    <button onClick={handlePrint}>Print</button>
                </div>
            </Styled.Header>

            <Styled.Card id="ipInfoCard">
                <Styled.Grid>
                    <span>Location Source</span><div className="val"><code>{info.locationSource}</code></div>

                    <span>IPv4</span>
                    <div className="val">
                        <code>{info.ipv4 || "—"}</code>
                        {!!info.ipv4 && (
                            <button onClick={() => copy(info.ipv4, "ipv4")}>
                                {lastCopied === "ipv4" ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>

                    <span>IPv6</span>
                    <div className="val">
                        <code>{info.ipv6 || "—"}</code>
                        {!!info.ipv6 && (
                            <button onClick={() => copy(info.ipv6, "ipv6")}>
                                {lastCopied === "ipv6" ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>

                    <span>ISP / Org</span><div className="val">{info.isp || info.org || "—"}</div>
                    <span>ASN</span><div className="val">{info.asn || "—"}</div>
                    <span>Country</span><div className="val">{info.country || "—"}</div>
                    <span>Region/State</span><div className="val">{info.region || "—"}</div>
                    <span>City</span><div className="val">{info.city || "—"}</div>
                    <span>Postal</span><div className="val">{info.postal || "—"}</div>
                    <span>Latitude</span><div className="val">{info.latitude ?? "—"}</div>
                    <span>Longitude</span><div className="val">{info.longitude ?? "—"}</div>
                    <span>Map</span>
                    <div className="val">
                        {mapHref ? (
                            <a href={mapHref} target="_blank" rel="noreferrer">Open on Map</a>
                        ) : (
                            "—"
                        )}
                    </div>
                    <span>Timezone</span><div className="val">{info.timezone || "—"}</div>
                    <span>UTC Offset</span><div className="val">{info.utc_offset || "—"}</div>
                    <span>Device (UA)</span><div className="val ua">{info.userAgent || "—"}</div>
                    <span>Connection</span><div className="val">{info.connection || "—"}</div>
                </Styled.Grid>

                <Styled.FootNote>
                    IP geolocation can show your ISP’s hub city (e.g., Chennai) instead of your actual city (Bengaluru). Use “Precise Location” for device-based accuracy.
                </Styled.FootNote>
            </Styled.Card>
        </Styled.Wrapper>
    );
}
