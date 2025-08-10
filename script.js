// Scientific calculator script (no eval)
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

// Tokenizer: numbers (including decimals), functions, operators, parentheses, percent
function tokenize(expr) {
  const re = /(sqrt|sin|cos|tan)|(\d+\.?\d*)|[+\-*/^()%]/g;
  const tokens = [];
  let m;
  while ((m = re.exec(expr)) !== null) {
    if (m[1]) tokens.push(m[1]);
    else if (m[2]) tokens.push(m[2]);
    else tokens.push(m[0]);
  }
  return tokens;
}

// Convert tokens from infix to postfix (Shunting Yard)
function infixToPostfix(tokens) {
  const out = [];
  const ops = [];
  const precedence = { '+':1, '-':1, '*':2, '/':2, '%':2, '^':4 };
  const rightAssoc = { '^': true };

  tokens.forEach(token => {
    if (!isNaN(token)) {
      out.push(token);
      return;
    }
    if (['sqrt', 'sin', 'cos', 'tan'].includes(token)) {
      ops.push(token);
      return;
    }
    if (token === '(') {
      ops.push(token);
      return;
    }
    if (token === ')') {
      while (ops.length && ops[ops.length-1] !== '(') out.push(ops.pop());
      ops.pop();
      if (ops.length && ['sqrt','sin','cos','tan'].includes(ops[ops.length-1])) out.push(ops.pop());
      return;
    }
    if (['+','-','*','/','%','^'].includes(token)) {
      while (ops.length && ops[ops.length-1] !== '(' &&
             (precedence[ops[ops.length-1]] > precedence[token] ||
             (precedence[ops[ops.length-1]] === precedence[token] && !rightAssoc[token]))) {
        out.push(ops.pop());
      }
      ops.push(token);
      return;
    }
  });

  while (ops.length) out.push(ops.pop());
  return out;
}

// Evaluate postfix
function evaluatePostfix(postfix) {
  const st = [];
  for (const t of postfix) {
    if (!isNaN(t)) { st.push(parseFloat(t)); continue; }
    if (['+','-','*','/','%','^'].includes(t)) {
      const b = st.pop(), a = st.pop();
      if (a === undefined || b === undefined) return NaN;
      switch(t){
        case '+': st.push(a+b); break;
        case '-': st.push(a-b); break;
        case '*': st.push(a*b); break;
        case '/': st.push(b!==0 ? a/b : NaN); break;
        case '%': st.push((a*b)/100); break;
        case '^': st.push(Math.pow(a,b)); break;
      }
      continue;
    }
    if (['sqrt','sin','cos','tan'].includes(t)) {
      const a = st.pop();
      if (a === undefined) return NaN;
      switch(t){
        case 'sqrt': st.push(Math.sqrt(a)); break;
        case 'sin': st.push(Math.sin(a * Math.PI / 180)); break;
        case 'cos': st.push(Math.cos(a * Math.PI / 180)); break;
        case 'tan': st.push(Math.tan(a * Math.PI / 180)); break;
      }
      continue;
    }
    return NaN;
  }
  return st.length ? st[st.length-1] : NaN;
}

function safeCalculate(expr) {
  try {
    const tokens = tokenize(expr);
    if (!tokens.length) return '';
    const postfix = infixToPostfix(tokens);
    const result = evaluatePostfix(postfix);
    return result;
  } catch(e) {
    return NaN;
  }
}

// Wire up buttons
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.value;
    const act = btn.dataset.action;

    if (act === 'clear') {
      display.value = '';
      return;
    }
    if (act === 'backspace') {
      display.value = display.value.slice(0, -1); // Remove last char
      return;
    }
    if (act === 'calculate') {
      const res = safeCalculate(display.value);
      display.value = (isNaN(res) || res === undefined) ? 'Error' : String(res);
      return;
    }
    display.value += val;
  });
});

// Keyboard handling
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((/^[0-9]$/.test(key)) || ['+','-','*','/','^','(',')','.','%'].includes(key)) {
    display.value += key;
    e.preventDefault();
    return;
  }
  if (key === 'Enter') {
    const res = safeCalculate(display.value);
    display.value = (isNaN(res) || res === undefined) ? 'Error' : String(res);
    e.preventDefault();
    return;
  }
  if (key === 'Backspace') {
    display.value = display.value.slice(0, -1); // Remove last char
    e.preventDefault();
    return;
  }
  if (key.toLowerCase() === 'c') {
    display.value = '';
    e.preventDefault();
    return;
  }
  if (/^[a-zA-Z]$/.test(key)) {
    display.value += key;
    e.preventDefault();
    return;
  }
});
