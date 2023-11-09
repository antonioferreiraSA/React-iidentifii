import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import Header from "../components/Header/Header";

const Home = () => {
  return (
    <div>
      <Header />
      <div className="home">
        <div className="container">
          <Sidebar />
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Home;
