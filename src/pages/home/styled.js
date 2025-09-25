import styled from "styled-components";

const maxw = "1080px";

export const Styled = {
    Wrapper: styled.div`
        padding: 24px;

        h1 {
            margin-bottom: 30px;
        }

        fieldset {
            padding: 15px;
            margin: 50px 0;
            border: 1px solid #333;

            legend {
                padding: 0 15px;
                font-size: 16px;
                color: #64493d;
            }
            .para {
                display: block;
                margin-bottom: 15px;
                max-width: 900px;

                .heading {
                    margin-bottom: 15px;
                }
                p {
                    margin-bottom: 15px;
                }

                .section {
                    margin-bottom: 15px;

                    ul {
                        margin-left: 30px;
                    }

                    h3 {
                        a {
                            color: #fff;
                            text-decoration: none;
                            &:hover {
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
        }
    `,
};

export const Row = styled.div`
    /* border-bottom: 1px solid #ccc; */
    display: flex;
    gap: 15px;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;

    &:hover {
        background-color: #000;
        /* color: #000;
        a {
            color: #000;
        } */
    }
`;
export const Col1 = styled.div`
    flex: 0 0 80px;
    white-space: nowrap;
`;
export const Col2 = styled.div`
    /* flex: 1 1 100%; */
    /* border: 1px solid #f00; */
    display: flex;
    align-items: center;
    gap: 15px;

    a {
        color: #aaa;
        overflow-wrap: anywhere;
        word-break: break-word;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
    .icon {
        /* border: 1px solid #f00; */
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
