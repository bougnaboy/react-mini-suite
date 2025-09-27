import React from "react";
import { Styled } from "./styled";
import { FaLeaf, FaTractor, FaSeedling, FaWater } from "react-icons/fa";
import { MdPhone, MdLocationOn } from "react-icons/md";

const FarmingLanding = () => {
    return (
        <Styled.Wrapper>
            {/* Hero */}
            <Styled.Hero>
                <div className="content">
                    <p className="eyebrow">Agri tools & tips</p>
                    <h1>Farming Landing</h1>
                    <p className="tagline">
                        Simple, practical utilities for better crops — soil to harvest.
                    </p>

                    <Styled.Actions>
                        <a href="#contact" className="btn primary">Talk to us</a>
                        <a href="#features" className="btn ghost">See features</a>
                    </Styled.Actions>
                </div>
            </Styled.Hero>

            {/* Features */}
            <Styled.Section id="features">
                <h2>What's inside</h2>
                <p className="sub">
                    Lightweight, offline-friendly helpers you can actually use on the field.
                </p>

                <Styled.Grid cols={4}>
                    <Styled.Card>
                        <div className="icon"><FaLeaf /></div>
                        <h3>Soil Health</h3>
                        <p>Basic checklist for pH, organic matter, and nutrient balance.</p>
                    </Styled.Card>

                    <Styled.Card>
                        <div className="icon"><FaSeedling /></div>
                        <h3>Seeds & Inputs</h3>
                        <p>Quick notes for variety, spacing, sowing depth, and seed rate.</p>
                    </Styled.Card>

                    <Styled.Card>
                        <div className="icon"><FaWater /></div>
                        <h3>Irrigation Planner</h3>
                        <p>Simple guidance for stage-wise watering & rough scheduling.</p>
                    </Styled.Card>

                    <Styled.Card>
                        <div className="icon"><FaTractor /></div>
                        <h3>Machinery & Tools</h3>
                        <p>Field-tested tips on prep, safety, and upkeep.</p>
                    </Styled.Card>
                </Styled.Grid>
            </Styled.Section>

            {/* Crops */}
            <Styled.Section>
                <h2>Focus Crops</h2>
                <Styled.Chips>
                    <li>Wheat</li>
                    <li>Rice</li>
                    <li>Maize</li>
                    <li>Pulses</li>
                    <li>Vegetables</li>
                    <li>Fruits</li>
                </Styled.Chips>
                <p className="note">
                    Notes are generic; always adapt to your soil, season, and local advisories.
                </p>
            </Styled.Section>

            {/* Contact / Footer */}
            <Styled.Section id="contact">
                <h2>Contact</h2>
                <Styled.Contact>
                    <div className="row">
                        <MdPhone /><a href="tel:+910000000000">+91 00000 00000</a>
                    </div>
                    <div className="row">
                        <MdLocationOn /> <span>Local advisory, India</span>
                    </div>
                    <p className="tiny">
                        This is a demo landing inside the hub. No login, no backend.
                    </p>
                </Styled.Contact>
            </Styled.Section>
        </Styled.Wrapper>
    );
};

export default FarmingLanding;
