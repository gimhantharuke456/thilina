import React from "react";
import { Tabs } from "antd";
import ProductManagement from "./ProductManagement";
import SalesManagement from "./SalesManagement";
const { TabPane } = Tabs;

const InventoryAndSales: React.FC = () => {
  return (
    <div style={styles.container}>
    <Tabs defaultActiveKey="1" tabPosition="top">
      <TabPane tab="Inventory" key="1">
        <ProductManagement />
      </TabPane>
      <TabPane tab="Sales" key="2">
        <SalesManagement />
      </TabPane>
    </Tabs>
    </div>
  );
};

export default InventoryAndSales;
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url("/bg-2.jpg")', // Replace with actual image link
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}
