import React, { useMemo, useState } from "react";
import { Styled } from "./styled";

/**
 * BMI Calculator — independent unit controls via <select> (no radio flip issues)
 * - Height units: cm OR ft/in
 * - Weight units: kg OR lb
 * - Auto-converts existing values when switching units
 * - Internally computes BMI with meters + kilograms
 */
const BmiCalculator = () => {
    // Units
    const [heightUnit, setHeightUnit] = useState("cm");   // 'cm' | 'ftin'
    const [weightUnit, setWeightUnit] = useState("kg");   // 'kg' | 'lb'

    // Inputs
    const [heightCm, setHeightCm] = useState("");
    const [heightFt, setHeightFt] = useState("");
    const [heightIn, setHeightIn] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [weightLb, setWeightLb] = useState("");

    // Conversions
    const INCH_TO_M = 0.0254;
    const LB_TO_KG = 0.45359237;
    const KG_TO_LB = 1 / LB_TO_KG;

    const feetInchesToMeters = (ft, inch) => {
        const inchesTotal = Number(ft || 0) * 12 + Number(inch || 0);
        return inchesTotal * INCH_TO_M;
    };

    // Convert on unit switch (preserve the same physical quantity)
    const handleHeightUnitChange = (e) => {
        const nextUnit = e.target.value; // 'cm' | 'ftin'
        if (nextUnit === heightUnit) return;

        if (nextUnit === "cm") {
            // ft/in -> cm
            const m = feetInchesToMeters(heightFt, heightIn);
            const cm = m * 100;
            setHeightCm(cm ? (Math.round(cm * 10) / 10).toString() : "");
        } else {
            // cm -> ft/in
            const m = Number(heightCm || 0) / 100;
            const totalInches = m / INCH_TO_M;
            const ft = Math.floor(totalInches / 12);
            const inch = Math.round(totalInches - ft * 12);
            setHeightFt(ft ? ft.toString() : "");
            setHeightIn(inch ? inch.toString() : "");
        }
        setHeightUnit(nextUnit);
    };

    const handleWeightUnitChange = (e) => {
        const nextUnit = e.target.value; // 'kg' | 'lb'
        if (nextUnit === weightUnit) return;

        if (nextUnit === "kg") {
            // lb -> kg
            const kg = Number(weightLb || 0) * LB_TO_KG;
            setWeightKg(kg ? (Math.round(kg * 10) / 10).toString() : "");
        } else {
            // kg -> lb
            const lb = Number(weightKg || 0) * KG_TO_LB;
            setWeightLb(lb ? (Math.round(lb * 10) / 10).toString() : "");
        }
        setWeightUnit(nextUnit);
    };

    const toMeters = () =>
        heightUnit === "cm"
            ? Number(heightCm || 0) / 100
            : feetInchesToMeters(heightFt, heightIn);

    const toKilograms = () =>
        weightUnit === "kg"
            ? Number(weightKg || 0)
            : Number(weightLb || 0) * LB_TO_KG;

    // WHO categories
    const categoryFor = (bmi) => {
        if (!bmi || Number.isNaN(bmi) || !Number.isFinite(bmi)) return { label: "—", tone: "muted" };
        if (bmi < 18.5) return { label: "Underweight", tone: "warn" };
        if (bmi < 25) return { label: "Normal", tone: "good" };
        if (bmi < 30) return { label: "Overweight", tone: "warn" };
        return { label: "Obesity", tone: "bad" };
    };

    // Compute BMI + healthy range (range shown in selected weight unit)
    const { bmi, cat, healthyMinDisp, healthyMaxDisp, rangeUnitLabel } = useMemo(() => {
        const m = toMeters();
        const kg = toKilograms();

        let computedBmi = 0;
        let minKg = 0, maxKg = 0;

        if (m > 0 && kg > 0) {
            computedBmi = kg / (m * m);
            minKg = 18.5 * (m * m);
            maxKg = 24.9 * (m * m);
        }

        const toDisplay = (kgVal) => {
            if (!kgVal) return 0;
            return weightUnit === "kg" ? kgVal : kgVal * KG_TO_LB;
        };

        return {
            bmi: computedBmi || 0,
            cat: categoryFor(computedBmi || 0),
            healthyMinDisp: toDisplay(minKg) || 0,
            healthyMaxDisp: toDisplay(maxKg) || 0,
            rangeUnitLabel: weightUnit === "kg" ? "kg" : "lb",
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [heightUnit, weightUnit, heightCm, heightFt, heightIn, weightKg, weightLb]);

    const resetAll = () => {
        if (!window.confirm("Clear all BMI inputs?")) return;
        setHeightUnit("cm");
        setWeightUnit("kg");
        setHeightCm("");
        setHeightFt("");
        setHeightIn("");
        setWeightKg("");
        setWeightLb("");
    };

    return (
        <Styled.Wrapper>
            <h2>BMI Calculator</h2>

            <Styled.Card>
                {/* Height unit selector */}
                <Styled.Row>
                    <label className="label" htmlFor="heightUnitSelect">Height Units</label>
                    <Styled.Select
                        id="heightUnitSelect"
                        value={heightUnit}
                        onChange={handleHeightUnitChange}
                    >
                        <option value="cm">Centimeters (cm)</option>
                        <option value="ftin">Feet/Inches (ft/in)</option>
                    </Styled.Select>
                </Styled.Row>

                {/* Height inputs */}
                {heightUnit === "cm" ? (
                    <Styled.Row>
                        <label htmlFor="heightCm" className="label">Height</label>
                        <Styled.InputGroup>
                            <input
                                id="heightCm"
                                type="number"
                                inputMode="decimal"
                                placeholder="e.g., 175"
                                value={heightCm}
                                onChange={(e) => setHeightCm(e.target.value)}
                                min="0"
                            />
                            <span className="suffix">cm</span>
                        </Styled.InputGroup>
                    </Styled.Row>
                ) : (
                    <Styled.Row>
                        <span className="label">Height</span>
                        <Styled.InputGrid>
                            <Styled.InputGroup>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="ft"
                                    value={heightFt}
                                    onChange={(e) => setHeightFt(e.target.value)}
                                    min="0"
                                />
                                <span className="suffix">ft</span>
                            </Styled.InputGroup>
                            <Styled.InputGroup>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="in"
                                    value={heightIn}
                                    onChange={(e) => setHeightIn(e.target.value)}
                                    min="0"
                                />
                                <span className="suffix">in</span>
                            </Styled.InputGroup>
                        </Styled.InputGrid>
                    </Styled.Row>
                )}

                {/* Weight unit selector */}
                <Styled.Row>
                    <label className="label" htmlFor="weightUnitSelect">Weight Units</label>
                    <Styled.Select
                        id="weightUnitSelect"
                        value={weightUnit}
                        onChange={handleWeightUnitChange}
                    >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="lb">Pounds (lb)</option>
                    </Styled.Select>
                </Styled.Row>

                {/* Weight inputs */}
                {weightUnit === "kg" ? (
                    <Styled.Row>
                        <label htmlFor="weightKg" className="label">Weight</label>
                        <Styled.InputGroup>
                            <input
                                id="weightKg"
                                type="number"
                                inputMode="decimal"
                                placeholder="e.g., 70"
                                value={weightKg}
                                onChange={(e) => setWeightKg(e.target.value)}
                                min="0"
                            />
                            <span className="suffix">kg</span>
                        </Styled.InputGroup>
                    </Styled.Row>
                ) : (
                    <Styled.Row>
                        <label htmlFor="weightLb" className="label">Weight</label>
                        <Styled.InputGroup>
                            <input
                                id="weightLb"
                                type="number"
                                inputMode="decimal"
                                placeholder="e.g., 154"
                                value={weightLb}
                                onChange={(e) => setWeightLb(e.target.value)}
                                min="0"
                            />
                            <span className="suffix">lb</span>
                        </Styled.InputGroup>
                    </Styled.Row>
                )}

                <Styled.Buttons>
                    <button type="button" onClick={resetAll} className="ghost">Reset</button>
                </Styled.Buttons>
            </Styled.Card>

            <Styled.ResultCard>
                <div className="resultTop">
                    <div>
                        <div className="muted">Your BMI</div>
                        <div className="bmiValue">{bmi ? bmi.toFixed(1) : "—"}</div>
                    </div>
                    <Styled.Badge $tone={cat.tone}>{cat.label}</Styled.Badge>
                </div>

                <Styled.HelpText>
                    <p>Healthy BMI range is <strong>18.5 – 24.9</strong>.</p>
                    <p>
                        For your height, a healthy weight is{" "}
                        <strong>
                            {healthyMinDisp ? healthyMinDisp.toFixed(1) : "—"} –{" "}
                            {healthyMaxDisp ? healthyMaxDisp.toFixed(1) : "—"} {rangeUnitLabel}
                        </strong>.
                    </p>
                    <p className="fine">
                        * BMI is a general indicator and may not perfectly represent health
                        for athletes, seniors, or people with high muscle mass.
                    </p>
                </Styled.HelpText>
            </Styled.ResultCard>
        </Styled.Wrapper>
    );
};

export default BmiCalculator;
