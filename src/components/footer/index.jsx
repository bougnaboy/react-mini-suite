import { Styled } from "./styled";

export default function Footer() {
    return (
        <>
            <Styled.Wrapper>
                <Styled.Col>&copy; {new Date().getFullYear()}</Styled.Col>
                <Styled.Col>
                    By <a
                        href="https://www.ashishranjan.net"
                        target="_blank"
                    >Ashish Ranjan</a>
                </Styled.Col>
            </Styled.Wrapper>
        </>
    );
}


