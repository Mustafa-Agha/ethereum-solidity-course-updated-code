import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { Link } from "@routes";

const HeaderNav = () => {
  return (
    <Menu>
      <Link route="/">
        <a className="item">
          <img src="/logo2.png" alt="CrowdFunding" className="logo-header"/>
        </a>
      </Link>

      <Menu.Menu position="right">
        <Link route="/">
          <a className="item">
            Campaigns
          </a>
        </Link>
        <Link route="/campaigns/new">
          <a className="item">
            <Icon name="add" />
          </a>
        </Link>
      </Menu.Menu>
    </Menu>
  );
};

export default HeaderNav;
