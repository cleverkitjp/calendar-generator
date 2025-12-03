// デバッグ用の最小スクリプト
alert("JS loaded (debug)");

// DOM構築後にボタンへイベント付与
window.addEventListener("DOMContentLoaded", () => {
  const genBtn = document.getElementById("generateCalBtn");
  const makeImgBtn = document.getElementById("makeImgBtn");
  const shareBtn = document.getElementById("shareBtn");

  if (genBtn) {
    genBtn.addEventListener("click", () => {
      alert("generateCalBtn clicked");
    });
  }

  if (makeImgBtn) {
    makeImgBtn.addEventListener("click", () => {
      alert("makeImgBtn clicked");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      alert("shareBtn clicked");
    });
  }
});
