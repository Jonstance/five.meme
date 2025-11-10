const disablePageScroll = () => {
  document.body.style.overflowY = "hidden";
};

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

const enablePageScroll = () => {
  document.body.style.overflowY = "scroll";
  scrollToTop();
};

const handleSidebarVisibility = (
  setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1000) {
      setSidebarVisible(false);
      setMenuOpen(false);
    } else {
      setSidebarVisible(true);
    }
  });
};

export {
  disablePageScroll,
  enablePageScroll,
  scrollToTop,
  handleSidebarVisibility,
};
