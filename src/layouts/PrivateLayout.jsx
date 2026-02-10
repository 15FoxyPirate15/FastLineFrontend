import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PrivateLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#1e1b4b] p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;
