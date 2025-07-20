import React from 'react'
import SideBar from './Components/SideBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex h-screen">
          <SideBar />
          <div className="flex-1 ml-20">
            <Outlet />
          </div>
        </div>
      );
}

export default Layout