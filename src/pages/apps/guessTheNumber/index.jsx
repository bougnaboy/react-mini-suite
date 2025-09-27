import React, { useState } from "react";
import { Styled } from "./styled";

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 100;
const MAX_ATTEMPTS = 10;

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const GuessTheNumber = () => {
    // active range
    const [min, setMin] = useState(DEFAULT_MIN);
    const [max, setMax] = useState(DEFAULT_MAX);

    // inputs for range controls
    const [minInput, setMinInput] = useState(String(DEFAULT_MIN));
    const [maxInput, setMaxInput] = useState(String(DEFAULT_MAX));

    const [secret, setSecret] = useState(() => randomInRange(DEFAULT_MIN, DEFAULT_MAX));
    const [guess, setGuess] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState("playing"); // "playing" | "won" | "lost"
    const [feedback, setFeedback] = useState("");

    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);

    function reset(keepRange = true, nextMin = min, nextMax = max) {
        setSecret(randomInRange(nextMin, nextMax));
        setGuess("");
        setAttempts(0);
        setHistory([]);
        setStatus("playing");
        setFeedback("");
        if (!keepRange) {
            setMin(nextMin);
            setMax(nextMax);
        }
    }

    function applyRange() {
        const nextMin = parseInt(String(minInput).trim(), 10);
        const nextMax = parseInt(String(maxInput).trim(), 10);

        if (Number.isNaN(nextMin) || Number.isNaN(nextMax)) {
            setFeedback("Enter valid numbers for Lower and Upper.");
            return;
        }
        if (nextMin >= nextMax) {
            setFeedback("Lower must be less than Upper.");
            return;
        }
        reset(false, nextMin, nextMax);
    }

    function onSubmit(e) {
        e.preventDefault();
        if (status !== "playing") return;

        const value = parseInt(String(guess).trim(), 10);
        if (Number.isNaN(value) || value < min || value > max) {
            setFeedback(`Enter a number between ${min} and ${max}.`);
            return;
        }

        const nextAttempts = attempts + 1;
        const nextHistory = [...history, value];
        setHistory(nextHistory);
        setAttempts(nextAttempts);

        if (value === secret) {
            setStatus("won");
            setFeedback(`🎯 Correct! ${value} is the number.`);
            return;
        }

        if (nextAttempts >= MAX_ATTEMPTS) {
            setStatus("lost");
            setFeedback(`Out of tries. The number was ${secret}.`);
            return;
        }

        setFeedback(value < secret ? "Too low." : "Too high.");
    }

    const feedbackTone =
        status === "won" ? "good" : status === "lost" ? "bad" : feedback ? "warn" : "";

    return (
        <Styled.Wrapper>
            <Styled.Card>
                <Styled.Title>Guess the Number</Styled.Title>
                <Styled.Subtitle>
                    Pick a range and guess the secret number. You have {MAX_ATTEMPTS} tries.
                </Styled.Subtitle>

                {/* Range controls */}
                <Styled.Settings>
                    <Styled.Field>
                        <Styled.Label htmlFor="lower">Lower</Styled.Label>
                        <Styled.NumInput
                            id="lower"
                            type="number"
                            value={minInput}
                            onChange={(e) => setMinInput(e.target.value)}
                            aria-label="Lower limit"
                        />
                    </Styled.Field>
                    <Styled.Field>
                        <Styled.Label htmlFor="upper">Upper</Styled.Label>
                        <Styled.NumInput
                            id="upper"
                            type="number"
                            value={maxInput}
                            onChange={(e) => setMaxInput(e.target.value)}
                            aria-label="Upper limit"
                        />
                    </Styled.Field>
                    <Styled.Button type="button" onClick={applyRange}>
                        Apply Range
                    </Styled.Button>
                    <Styled.RangeNote>Range: {min}–{max}</Styled.RangeNote>
                </Styled.Settings>

                {/* Guess form */}
                <form onSubmit={onSubmit}>
                    <Styled.Row>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            placeholder={`Enter ${min}–${max}`}
                            min={min}
                            max={max}
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            disabled={status !== "playing"}
                            aria-label="Your guess"
                        />
                        <Styled.Button type="submit" disabled={status !== "playing"}>
                            Guess
                        </Styled.Button>
                        <Styled.Button type="button" onClick={() => reset(true)} $variant="ghost">
                            New Game
                        </Styled.Button>
                    </Styled.Row>
                </form>

                <Styled.Meta>
                    <span>Attempts: {attempts}/{MAX_ATTEMPTS}</span>
                    <span>Left: {attemptsLeft}</span>
                    <span>Range: {min}–{max}</span>
                </Styled.Meta>

                {feedback && <Styled.Message className={feedbackTone}>{feedback}</Styled.Message>}

                {history.length > 0 && (
                    <>
                        <Styled.H3>Your Guesses</Styled.H3>
                        <Styled.History>
                            {history.map((g, i) => (
                                <li key={i}>
                                    <span>#{i + 1}</span>
                                    <b>{g}</b>
                                </li>
                            ))}
                        </Styled.History>
                    </>
                )}
            </Styled.Card>
        </Styled.Wrapper>
    );
};

export default GuessTheNumber;
