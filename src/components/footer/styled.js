import styled from "styled-components";

const Wrapper = styled.div`
    background-color: #010409;
    color: #aaa;
    margin-top: 50px;
    overflow: hidden;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (width<900px) {
        padding: 15px;
    }
`;

const Col = styled.div`
    a {
        color: #aaa;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

export const Styled = {
    Wrapper,
    Col,
};
