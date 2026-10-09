import './style.css'
import { ClockComponent, StopwatchComponent } from './clock';


let currentInput = '0';
let lastInput = '0';
let operation = '';
let shouldResetInput = false;


document.addEventListener('DOMContentLoaded', () => {

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
      <h1>Calculadora</h1>
      <div class="calculadora">
        <div class="display">
          <input type="text" class="display-input" value="0" disabled />
        </div>
        <div class="top-bar">
          <div id="clock-container"></div>
          <button class="programmer-toggle">Modo programador</button>
        </div>
        <div id="stopwatch-container"></div>
        <div class="programmer-panel hidden" aria-hidden="true">
          <div class="base-row">
            <label for="prog-hex">HEX</label>
            <input id="prog-hex" class="prog-input" data-base="16" inputmode="text" autocomplete="off" />
          </div>
          <div class="base-row">
            <label for="prog-dec">DEC</label>
            <input id="prog-dec" class="prog-input" data-base="10" inputmode="numeric" autocomplete="off" />
          </div>
          <div class="base-row">
            <label for="prog-oct">OCT</label>
            <input id="prog-oct" class="prog-input" data-base="8" inputmode="numeric" autocomplete="off" />
          </div>
          <div class="base-row">
            <label for="prog-bin">BIN</label>
            <input id="prog-bin" class="prog-input" data-base="2" inputmode="numeric" autocomplete="off" />
          </div>
        </div>
        <div class="keys-wrapper">
          <div class="hex-keys hidden" aria-hidden="true">
            <button class="hex-key" data-hex="A">A</button>
            <button class="hex-key" data-hex="B">B</button>
            <button class="hex-key" data-hex="C">C</button>
            <button class="hex-key" data-hex="D">D</button>
            <button class="hex-key" data-hex="E">E</button>
            <button class="hex-key" data-hex="F">F</button>
          </div>
          <div class="teclado">
          <button class="delete span-two">DEL</button>
          <button class="reset">C</button>
          <button class="operation" data-action="sign">+/-</button>
          <button class="operation" data-action="square">x²</button>
          <button class="operation" data-action="sqrt">√x</button>
          <button class="operation" data-action="inverse">1/x</button>
          <button class="operation" data-action="+">+</button>
          <button class="number" data-value="7">7</button>
          <button class="number" data-value="8">8</button>
          <button class="number" data-value="9">9</button>
          <button class="operation" data-action="-">-</button>
          <button class="number" data-value="4">4</button>
          <button class="number" data-value="5">5</button>
          <button class="number" data-value="6">6</button>
          <button class="operation" data-action="*">*</button>
          <button class="number" data-value="1">1</button>
          <button class="number" data-value="2">2</button>
          <button class="number" data-value="3">3</button>
          <button class="operation" data-action="/">/</button>        
          <button class="equals span-two">=</button>
          <button class="number" data-value="0">0</button>
          <button class="decimal">.</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const syncProgrammerIfOpen = (): void => {
    const panel = document.querySelector('.programmer-panel') as HTMLDivElement | null;
    if(!panel || panel.classList.contains('hidden')) return;
    const decNum = Math.trunc(parseFloat(currentInput) || 0);
    const set = (id: string, v: string) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if(el) el.value = v;
    };
    set('prog-hex', decNum.toString(16).toUpperCase());
    set('prog-dec', decNum.toString(10));
    set('prog-oct', decNum.toString(8));
    set('prog-bin', decNum.toString(2));
  };

  const elements = document.getElementsByClassName('number');
  if(elements){  
    Array.from(elements).forEach((element) => {
      element.addEventListener('click', (event) => {     
        const value = (event.target as HTMLElement).dataset.value   
        
        if(shouldResetInput){
          currentInput = value || '0';
          shouldResetInput = false;
        } else {
          if(currentInput==='0' && value==='0') return;                
          if(currentInput==='0') currentInput='';
          currentInput += value;
        }
        
        (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
        syncProgrammerIfOpen();
        
      });    
    });
  }
  const resetButton = document.querySelector('.reset');
  if(resetButton){
    resetButton.addEventListener('click', () => {
      currentInput = '0';
      lastInput = '0';
      operation = '';
      shouldResetInput = false;
      (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
      syncProgrammerIfOpen();
    });
  }

  const programmerPanel = document.querySelector('.programmer-panel') as HTMLDivElement | null;
  const programmerToggle = document.querySelector('.programmer-toggle');
  const progInputs = Array.from(document.querySelectorAll<HTMLInputElement>('.prog-input'));

  const parseFromBase = (text: string, base: number): number | null => {
    if(text.trim() === '') return 0;
    const regexByBase: Record<number, RegExp> = {
      2: /^[0-1]+$/i,
      8: /^[0-7]+$/i,
      10: /^-?[0-9]+$/,
      16: /^[0-9a-f]+$/i,
    };
    const rx = regexByBase[base];
    if(!rx.test(text)) return null;
    const parsed = parseInt(text, base);
    if(Number.isNaN(parsed)) return null;
    return parsed;
  };

  const updateAllBasesFromDecimal = (decimalValue: number): void => {
    const hex = decimalValue.toString(16).toUpperCase();
    const dec = decimalValue.toString(10);
    const oct = decimalValue.toString(8);
    const bin = decimalValue.toString(2);
    const set = (id: string, v: string) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if(el) el.value = v;
    };
    set('prog-hex', hex);
    set('prog-dec', dec);
    set('prog-oct', oct);
    set('prog-bin', bin);
  };

  const syncFromInput = (source: HTMLInputElement): void => {
    const base = Number(source.dataset.base || '10');
    const text = source.value.trim();
    const parsed = parseFromBase(text, base);
    if(parsed === null){
      
      const decEl = document.getElementById('prog-dec') as HTMLInputElement | null;
      const currentDec = decEl && decEl.value ? parseInt(decEl.value, 10) : 0;
      updateAllBasesFromDecimal(Number.isNaN(currentDec) ? 0 : currentDec);
      return;
    }
    updateAllBasesFromDecimal(parsed);
  };

  if(programmerToggle && programmerPanel){
    programmerToggle.addEventListener('click', () => {
      programmerPanel.classList.toggle('hidden');
      const hidden = programmerPanel.classList.contains('hidden');
      programmerPanel.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      const hexKeys = document.querySelector('.hex-keys') as HTMLDivElement | null;
      if(hexKeys){
        hexKeys.classList.toggle('hidden', hidden);
        hexKeys.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      }
      const keysWrapper = document.querySelector('.keys-wrapper') as HTMLDivElement | null;
      if(keysWrapper){
        keysWrapper.classList.toggle('prog-on', !hidden);
      }
      if(!hidden){
        
        const decNumber = Math.trunc(parseFloat(currentInput) || 0);
        updateAllBasesFromDecimal(decNumber);
      }
    });
  }

  if(progInputs.length){
    progInputs.forEach((input) => {
      input.addEventListener('input', () => syncFromInput(input));
      input.addEventListener('blur', () => syncFromInput(input));
    });
  }


  const appendHexDigit = (digit: string): void => {
    const panel = document.querySelector('.programmer-panel') as HTMLDivElement | null;
    if(!panel || panel.classList.contains('hidden')) return;
    const hexEl = document.getElementById('prog-hex') as HTMLInputElement | null;
    if(!hexEl) return;
    const next = (hexEl.value === '0' ? '' : hexEl.value) + digit.toUpperCase();
    // Validate as hex
    const parsed = parseFromBase(next, 16);
    if(parsed === null) return;
    hexEl.value = next.toUpperCase();
    updateAllBasesFromDecimal(parsed);
    currentInput = String(parsed);
    (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
  };

  const hexButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.hex-key'));
  if(hexButtons.length){
    hexButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.hex || '';
        if(d) appendHexDigit(d);
      });
    });
  }

  const deleteButton = document.querySelector('.delete');
  if(deleteButton){
    deleteButton.addEventListener('click', () => {
      if(currentInput.length === 1){
        currentInput = '0';
      } else {
        currentInput = currentInput.slice(0, -1);
      }
      (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
      syncProgrammerIfOpen();
    });
  }

  const decimalButton = document.querySelector('.decimal');
  if(decimalButton){
    decimalButton.addEventListener('click', () => {
      if(shouldResetInput){
        currentInput = '0.';
        shouldResetInput = false;
      } else {
        if(!currentInput.includes('.')){
          currentInput += '.';
        }
      }
      (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
      syncProgrammerIfOpen();
    });
  }


  const calculate = (): number => {
    const num1 = parseFloat(lastInput);
    const num2 = parseFloat(currentInput);
    
    switch(operation){
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '*':
        return num1 * num2;
      case '/':
        return num2 !== 0 ? num1 / num2 : 0;
      default:
        return num2;
    }
  };

  const executeUnaryOperation = (action: string): void => {
    const num = parseFloat(currentInput);
    let result: number | string;
    
    switch(action){
      case 'sign':
        if(currentInput !== '0'){
          result = currentInput.startsWith('-') ? currentInput.substring(1) : '-' + currentInput;
          currentInput = result;
          (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
        }
        return;
      case 'square':
        result = num * num;
        break;
      case 'sqrt':
        if(num >= 0){
          result = Math.sqrt(num);
        } else {
          result = 'Error';
        }
        break;
      case 'inverse':
        if(num !== 0){
          result = 1 / num;
        } else {
          result = 'Error';
        }
        break;
      default:
        return;
    }
    
    currentInput = result.toString();
    (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
    shouldResetInput = true;
    syncProgrammerIfOpen();
  };

  
  const operationButtons = document.getElementsByClassName('operation');
  if(operationButtons){
    Array.from(operationButtons).forEach((button) => {
      button.addEventListener('click', (event) => {
        const action = (event.target as HTMLElement).dataset.action;

        if(action === 'sign' || action === 'square' || action === 'sqrt' || action === 'inverse'){
          executeUnaryOperation(action);
          return;
        }
        
        if(operation && !shouldResetInput){
          //operacion pendiente esperar
          const result = calculate();
          currentInput = result.toString();
          (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
          syncProgrammerIfOpen();
        }
        
        lastInput = currentInput;
        operation = action || '';
        shouldResetInput = true;
      });
    });
  }

  
  const equalsButton = document.querySelector('.equals');
  if(equalsButton){
    equalsButton.addEventListener('click', () => {
      if(operation){
        const result = calculate();
        currentInput = result.toString();
        (document.querySelector('.display-input') as HTMLInputElement)!.value = currentInput;
        lastInput = '0';
        operation = '';
        shouldResetInput = true;
        syncProgrammerIfOpen();
      }
    });
  }
  const clockContainer = document.getElementById('clock-container');
  if(clockContainer){
    const clockComponent = new ClockComponent();
    clockContainer.appendChild(clockComponent.getElement());
    // Conecta el componente al observable para mantener visible la hora actual
    clockComponent.subscribeToClock();
  }
  const stopwatchContainer = document.getElementById('stopwatch-container');
  if(stopwatchContainer){
    const stopwatchComponent = new StopwatchComponent();
    stopwatchContainer.appendChild(stopwatchComponent.getElement());
  }
});
