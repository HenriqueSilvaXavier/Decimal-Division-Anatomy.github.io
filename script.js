function gcd(a, b) {
  while (b !== 0) {
    let t = b;
    b = a % b;
    a = t;
  }
  return Math.abs(a);
}

function isRepeatingDecimal(numerator, denominator) {
  const gcdVal = gcd(numerator, denominator);
  let simplifiedDenominator = denominator / gcdVal;
  while (simplifiedDenominator % 2 === 0) simplifiedDenominator /= 2;
  while (simplifiedDenominator % 5 === 0) simplifiedDenominator /= 5;
  return simplifiedDenominator !== 1;
}

function calculateDivision(d1, d2) {
  const subtractions = [];
  let wasScaled = false;
  let scaleCount = 0;

  while (!Number.isInteger(d1) || !Number.isInteger(d2)) {
    d1 *= 10;
    d2 *= 10;
    wasScaled = true;
    scaleCount++;
  }

  const isRepeating = isRepeatingDecimal(d1, d2);
  let integerPart = Math.floor(d1 / d2);
  let remainder = d1 - integerPart * d2;
  subtractions.push({ multiplication: integerPart * d2, remainder });
  let decimalQuotient = '' + integerPart;

  if (remainder !== 0) {
    decimalQuotient += ".";
    const seenRemainders = {};
    const digits = [];
    let cycleStartPosition = null;
    let digitCounter = 0;
    const maxDigits = 100;
    let zeroSubtractedAlready = false;

    while (remainder !== 0 && digitCounter < maxDigits) {
      if (seenRemainders[remainder] !== undefined) {
        cycleStartPosition = seenRemainders[remainder];
        break;
      }
      seenRemainders[remainder] = digitCounter;

      remainder *= 10;
      let digit = Math.floor(remainder / d2);
      let multiplication = digit * d2;
      remainder -= multiplication;

      if (multiplication > 0 || !zeroSubtractedAlready) {
        subtractions.push({ multiplication, remainder });
      }

      digits.push(digit);
      digitCounter++;
    }

    if (cycleStartPosition === null) {
      decimalQuotient += digits.join("");
    } else {
      const nonRepeating = digits.slice(0, cycleStartPosition);
      const repeating = digits.slice(cycleStartPosition);
      decimalQuotient += nonRepeating.join("");

      const repeatingTimes = 2;
      for (let i = 0; i < repeatingTimes; i++) {
        for (let j = 0; j < repeating.length; j++) {
          let digit = repeating[j];
          remainder *= 10;
          let multiplication = digit * d2;
          remainder -= multiplication;

          subtractions.push({ multiplication, remainder });
          decimalQuotient += digit;
        }
      }

      for (let digit of repeating) {
        decimalQuotient += digit;
      }
    }
  }

  return { quotient: decimalQuotient, subtractions, wasScaled, scaleCount, isRepeating, d1, d2 };
}

document.getElementById("divisionForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const dividend = parseFloat(document.getElementById("dividend").value);
  const divisor = parseFloat(document.getElementById("divisor").value);
  const scaleNote = document.getElementById("scaleNote");

  if (divisor === 0) {
    alert("Error: Division by zero.");
    return;
  }

  const result = calculateDivision(dividend, divisor);
  document.getElementById("dividend-container").textContent = result.d1;
  document.getElementById("divisor-container").textContent = result.d2;
  document.getElementById("quotient-container").textContent = result.quotient;
  const remainderContainer = document.getElementById("remainder-container");
  remainderContainer.innerHTML = "";

  if (result.wasScaled) {
    scaleNote.style.display = "block";
    scaleNote.textContent = `Note: The dividend and divisor were multiplied by 10 (${result.scaleCount} time${result.scaleCount > 1 ? "s" : ""}) to eliminate decimal points.`;
  } else {
    scaleNote.style.display = "none";
  }

  let space = -10;
  let remainderBackup;

  result.subtractions.forEach((step, i) => {
    if (typeof remainderBackup !== "undefined" && step.multiplication.toString().length < remainderBackup.toString().length) {
      space += 15;
    }

    const width = step.multiplication.toString().length * 25;
    const pMul = document.createElement("p");
    pMul.style.width = `${width}px`;
    pMul.style.marginLeft = `${space}px`;
    pMul.style.marginTop = "-30px";
    pMul.style.borderBottom = "3px solid black";
    pMul.textContent = "-" + step.multiplication;
    remainderContainer.appendChild(pMul);

    let digitLength = step.multiplication.toString().length;
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    
    if (mediaQuery.matches) {
      if (step.multiplication > 0) {
        space += (digitLength - step.remainder.toString().length) * 16.5;
      }
    } else {
      if (step.multiplication > 0) {
        space += (digitLength - step.remainder.toString().length) * 14.8;
      }
    }
    space += 10.14;

    const pRem = document.createElement("p");
    pRem.style.marginLeft = `${space}px`;
    pRem.style.marginTop = "-30px";
    pRem.textContent = i === result.subtractions.length - 1 ? step.remainder : step.remainder * 10;
    remainderContainer.appendChild(pRem);

    space -= 8;
    remainderBackup = step.remainder * 10;
  });

  const resultType = document.getElementById("result-type");
  resultType.innerHTML = result.isRepeating
    ? `<p style='color: red; font-weight: bold;'>Warning: this division results in a repeating decimal! The cycle was repeated 3 times.</p>`
    : `<p style='color: green; font-weight: bold;'>This division has an exact decimal result.</p>`;
});

function exportImage() {
  const scrollableDiv = document.getElementById('structure-container');
  
    // Clonar o conteúdo inteiro, sem o scroll
    const clone = scrollableDiv.cloneNode(true);
    clone.style.width = scrollableDiv.scrollWidth + 'px';
    clone.style.height = scrollableDiv.scrollHeight + 'px';
    clone.style.overflow = 'visible';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px'; // esconder da tela

    document.body.appendChild(clone);

    html2canvas(clone).then(canvas => {
        const link = document.createElement('a');
        link.download = 'division.png';
        link.href = canvas.toDataURL();
        link.click();
        document.body.removeChild(clone);
    });
}