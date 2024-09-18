export const neutralizeBack = (callback: () => void) => {
  window.history.pushState(null, '', window.location.href);
  window.onpopstate = () => {
    window.history.pushState(null, '', window.location.href);
    callback();
  };
};

export const reviveBack = () => {
  window.onpopstate = () => {};
  window.history.back();
};
