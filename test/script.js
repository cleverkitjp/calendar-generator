const questions = [
  {
    text: "次のうち、\"efficient\" の意味として最も適切なのはどれですか？",
    choices: [
      "効率的な",
      "感情的な",
      "緊急の",
      "優先される"
    ],
    answer: 0,
    explanation: "efficient は「効率的な」「能率的な」を表します。"
  },
  {
    text: "He ___ a letter to his friend every week. の空欄に入る動詞として正しいものはどれですか？",
    choices: [
      "write",
      "writes",
      "wrote",
      "writing"
    ],
    answer: 1,
    explanation: "主語が He で現在形なので 3 人称単数の writes になります。"
  },
  {
    text: "次の中で副詞として使われるものはどれですか？",
    choices: [
      "quick",
      "quicker",
      "quickly",
      "quickness"
    ],
    answer: 2,
    explanation: "quickly は副詞で「素早く」という意味です。"
  }
];

let currentIndex = 0;
let selectedIndex = null;

const questionText = document.getElementById("questionText");
const questionLabel = document.getElementById("questionLabel");
const choiceList = document.getElementById("choiceList");
const feedback = document.getElementById("feedback");
const progress = document.getElementById("progress");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function renderQuestion() {
  const question = questions[currentIndex];
  selectedIndex = null;

  questionLabel.textContent = `Q${currentIndex + 1}`;
  questionText.textContent = question.text;
  progress.textContent = `問題 ${currentIndex + 1}/${questions.length}`;

  choiceList.innerHTML = "";
  question.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-button";
    btn.innerHTML = `
      <span class="choice-button__label">${String.fromCharCode(65 + idx)}</span>
      <p class="choice-button__text">${choice}</p>
    `;
    btn.addEventListener("click", () => handleChoice(idx, btn));
    choiceList.appendChild(btn);
  });

  feedback.hidden = true;
  feedback.textContent = "";
  feedback.classList.remove("is-correct", "is-wrong");

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === questions.length - 1;
}

function handleChoice(idx, button) {
  selectedIndex = idx;
  document.querySelectorAll(".choice-button").forEach((btn) => btn.classList.remove("selected"));
  button.classList.add("selected");
  showFeedback();
}

function showFeedback() {
  const question = questions[currentIndex];
  const isCorrect = selectedIndex === question.answer;
  feedback.hidden = false;
  feedback.textContent = isCorrect
    ? `正解です！ ${question.explanation}`
    : `残念！ 正解は「${question.choices[question.answer]}」。${question.explanation}`;
  feedback.classList.toggle("is-correct", isCorrect);
  feedback.classList.toggle("is-wrong", !isCorrect);
}

prevBtn.addEventListener("click", () => {
  if (currentIndex === 0) return;
  currentIndex -= 1;
  renderQuestion();
});

nextBtn.addEventListener("click", () => {
  if (currentIndex >= questions.length - 1) return;
  currentIndex += 1;
  renderQuestion();
});

renderQuestion();
