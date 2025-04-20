import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/dashboard';
import './App.css';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

export default App;