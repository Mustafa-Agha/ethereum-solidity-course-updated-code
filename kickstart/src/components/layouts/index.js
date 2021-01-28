import React from "react";
import { Container } from "semantic-ui-react";
import { HeaderNav } from "@elements";

const Layout = ({ children }) => {
    return(
        <Container>
            <HeaderNav />
            {children}
        </Container>
    );
};

export default Layout;