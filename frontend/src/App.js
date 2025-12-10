import './App.css';
import './styles/responsive.css';
import Home from './screens/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Login from './screens/Login';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Signup from './screens/Signup';
import { CartProvider } from './components/ContextReducer';
import Cart from './screens/Cart';
import MyOrder from './screens/MyOrder';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <div> 
            <Routes>
              <Route exact path="/" element={<Home/>}/>
              <Route exact path="/login" element={<Login/>}/>
              <Route exact path="/createuser" element={<Signup/>}/>
              <Route exact path="/myOrder" element={<MyOrder/>}/>
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
