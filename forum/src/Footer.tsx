import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();
  return (
    <div className="footer-container d-flex justify-content-center">
      <a className="px-2" onClick={() => navigate("/")}>
        Home
      </a>
      <a className="px-2" target="#" href="https://github.com">
        Repo
      </a>
    </div>
  );
}

export default Footer;
