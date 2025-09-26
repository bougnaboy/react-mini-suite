import React from 'react'
import { Col1, Col2, Row, Styled } from './styled'
import { FaFacebook, FaGithub, FaLinkedin, FaPhoneAlt, FaUser, FaYoutube } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import IndianFlag from '../../components/IndianFlag'
import { TbWorldWww } from 'react-icons/tb'

const Home = () => {


    return (
        <>
            <Styled.Wrapper>
                <h3>Freelance Apps Hub - last updated: Sep 25, 2025</h3>

                <fieldset>
                    <legend>About Project</legend>
                    <div className='para'>
                        <div className='section'>
                            <b>Freelance Apps Hub</b> is a clean collection of the mini-tools I built across years of freelancing-now open-sourced. Each app solves one real, focused problem for schools, students, tuitions, gyms, institutes, small orgs, and developers.
                        </div>
                        <div className='section'>
                            <h3>What's inside</h3>
                            <ul>
                                <li>Vanilla HTML + SCSS + JavaScript apps, hosted in a lightweight React (Vite) shell</li>
                                <li>Apps load in isolation (no CSS/JS clashes), offline-first, and print-ready</li>
                                <li>Examples: UPI QR Generator, Daily Focus Planner, Cash Denomination Counter (more coming)</li>
                            </ul>
                        </div>

                        <div className='section'>
                            <h3>How to use</h3>
                            <ul>
                                <li>Pick an app from the left → start using instantly</li>
                                <li>Use Print / Save as PDF where available</li>
                                <li>Your data stays on your device ( localStorage only )</li>
                            </ul>
                        </div>

                        <div className='section'>
                            <h3>Why this exists</h3>
                            <ul>
                                <li>Share real client-style utilities with the community</li>
                                <li>Reusable patterns for counters, billing, planning, and simple ops</li>
                            </ul>
                        </div>

                        <div className='section'>
                            <h3>Contribute / Feedback</h3>
                            ⭐ the repo, file issues, or suggest an app idea
                        </div>

                        <div className='section'>
                            <h3>Live: <a href="https://a2rp.github.io/freelance-apps-hub/home" target='_blank'>a2rp.github.io/freelance-apps-hub/home</a></h3>
                            <h3>Code: <a href="https://github.com/a2rp/freelance-apps-hub" target='_blank'>github.com/a2rp/freelance-apps-hub</a></h3>
                        </div>
                    </div>
                </fieldset >

                <fieldset>
                    <legend>About Developer</legend>
                    <div className='aboutDeveloper'>
                        <Row>
                            <Col1>Name</Col1>
                            <Col2>
                                Ashish Ranjan
                                <div className="icon"><FaUser size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>Phone</Col1>
                            <Col2>
                                <a
                                    href="tel:+918123747965"
                                >+91 8123747965</a>
                                <div className="icon"><FaPhoneAlt size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>Email</Col1>
                            <Col2>
                                <a
                                    href="mailto:ash.ranjan09@gmail.com"
                                >ash.ranjan09@gmail.com</a>
                                <div className="icon"><MdEmail size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>Nationality</Col1>
                            <Col2>
                                The Republic of India
                                <div className="icon"><IndianFlag /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>Website</Col1>
                            <Col2>
                                <a
                                    href="https://www.ashishranjan.net/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >https://www.ashishranjan.net/</a>
                                <div className="icon"><TbWorldWww size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>Old Website</Col1>
                            <Col2>
                                <a
                                    href="http://www.ashishranjan.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >http://www.ashishranjan.in/</a>
                                <div className="icon"><TbWorldWww size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>Facebook</Col1>
                            <Col2>
                                <a
                                    href="https://www.facebook.com/theash.ashish/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >facebook.com/theash.ashish/</a>
                                <div className="icon"><FaFacebook size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>LinkedIn</Col1>
                            <Col2>
                                <a
                                    href="https://www.linkedin.com/in/aashishranjan/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >linkedin.com/in/aashishranjan/</a>
                                <div className="icon"><FaLinkedin size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>YouTube</Col1>
                            <Col2>
                                <a
                                    href="https://www.youtube.com/channel/UCLHIBQeFQIxmRveVAjLvlbQ"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >youtube.com/channel/UCLHIBQeFQIxmRveVAjLvlbQ</a>
                                <div className="icon"><FaYoutube size={20} /></div>
                            </Col2>
                        </Row>
                        <Row>
                            <Col1>GitHub</Col1>
                            <Col2>
                                <a
                                    href="https://github.com/a2rp"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >github.com/a2rp</a>
                                <div className="icon"><FaGithub size={20} /></div>
                            </Col2>
                        </Row>
                    </div>
                </fieldset>
            </Styled.Wrapper >
        </>
    )
}

export default Home

