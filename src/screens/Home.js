import logo from "assets/logo.svg";
import { CurrentIssue } from "components/CurrentIssue";
import { useStickyState } from "utils";

const Home = () => {
  const [token, setToken] = useStickyState("", "GH_token");
  return (
    <div className="home">
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
        <p>SR(A)WN Editor</p>
      </header>
      <section>
        <h2>GitHub Personal Access Token</h2>
        <p>
          This is used to query the{" "}
          <a href="https://github.com/srobo/srawn">SR(A)WN repository</a> for
          existing issues and fetching the comments of those issues.
        </p>
        <input
          type="password"
          placeholder="GitHub Personal Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </section>
      <CurrentIssue />
    </div>
  );
};

export default Home;
