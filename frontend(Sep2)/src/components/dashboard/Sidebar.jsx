import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline'; // Example icon

const masters = [
  { name: 'Stations', path: 'stations' },
  { name: 'Mixing Groups', path: 'mixing-groups' },
  { name: 'Mixings', path: 'mixings' },
  { name: 'Varieties', path: 'varieties' },
  { name: 'States', path: 'states' },
  { name: 'Brokers', path: 'brokers' },
  { name: 'Commodities', path: 'commodities' },
  { name: 'Waste Invoice Types', path: 'waste-invoice-types' },
  { name: 'Transports', path: 'transports' },
  { name: 'Waste Masters', path: 'waste-masters' },
  { name: 'Cost Masters', path: 'cost-masters' },
  { name: 'Waste Lots', path: 'waste-lots' },
  { name: 'Waste Packing Types', path: 'waste-packing-types' },
  { name: 'Godowns', path: 'godowns' },
];

const Sidebar = () => (
  <div className="w-64 bg-white shadow-lg p-4">
    <h2 className="text-xl font-bold mb-4">Masters</h2>
    <ul>
      {masters.map((master) => (
        <li key={master.path}>
          <Link
            to={`/dashboard/${master.path}`}
            className="flex items-center py-2 px-4 hover:bg-blue-100 rounded-lg"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            {master.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Sidebar;