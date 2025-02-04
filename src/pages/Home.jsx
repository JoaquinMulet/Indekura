import { useEffect } from 'react';
import './Home.css';

const Home = () => {
  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Inicio';
  }, []);

  return (
    <main className="home-container">
      <section className="home-content">
        <h1 className="home-title">Indekura Hedge Fund</h1>
      </section>
    </main>
  );
};

export default Home;
