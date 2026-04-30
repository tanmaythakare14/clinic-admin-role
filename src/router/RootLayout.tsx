import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoGuide } from '@/components/demo-guide/DemoGuide';
import { SettingsDemoControl } from '@/components/demo-guide/SettingsDemoControl';

export function RootLayout(): React.JSX.Element {
  return (
    <>
      <Outlet />
      <DemoGuide />
      <SettingsDemoControl />
    </>
  );
}
