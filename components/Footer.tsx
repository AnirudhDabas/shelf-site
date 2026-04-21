export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#top" className="nav-brand" aria-label="shelf home">
          <span className="dot" />
          <span>shelf</span>
        </a>
        <div>
          MIT ·{" "}
          <a
            href="https://github.com/AnirudhDabas/shelf"
            target="_blank"
            rel="noreferrer"
          >
            github.com/AnirudhDabas/shelf
          </a>
        </div>
      </div>
    </footer>
  );
}
