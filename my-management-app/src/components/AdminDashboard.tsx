import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  MoneyCollectOutlined,
  LaptopOutlined,
  ShopFilled,
  MoneyCollectFilled,
  UserOutlined,
} from "@ant-design/icons";
import "../App.css";
import SalaryManagement from "./SalaryManagement";
import ProductManagement from "./ProductManagement";
import SalesManagement from "./SalesManagement";
import UtilityExpencesManagement from "./UtilityExpencesManagement";
import UserManagement from "./UserManagement";

const { Content, Sider } = Layout;

const AdminDashboard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(1);

  const onMenuItemClicked = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <Layout>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{ height: "100%", borderRight: 0 }}
            theme="light" // Set the theme to light
          >
            <Menu.Item
              onClick={() => {
                onMenuItemClicked(0);
              }}
              key="0"
              icon={<UserOutlined />}
            >
              Users
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                onMenuItemClicked(1);
              }}
              key="1"
              icon={<MoneyCollectOutlined />}
            >
              Utility Expences
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                onMenuItemClicked(2);
              }}
              key="2"
              icon={<LaptopOutlined />}
            >
              Products
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                onMenuItemClicked(3);
              }}
              key="3"
              icon={<ShopFilled />}
            >
              Sales
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                onMenuItemClicked(4);
              }}
              key="4"
              icon={<MoneyCollectFilled />}
            >
              Salary Management
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {activeIndex === 0 && <UserManagement />}
            {activeIndex === 1 && <UtilityExpencesManagement />}
            {activeIndex === 2 && <ProductManagement />}
            {activeIndex === 3 && <SalesManagement />}
            {activeIndex === 4 && <SalaryManagement />}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
