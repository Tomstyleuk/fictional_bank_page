'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
    '2020-03-10T10:51:36.790Z',
    '2020-03-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  // If we do something today, then print out "today"
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};


/** format currency for each account object
 * and this function can be reuseable for other application
 */
const formatCur = function (value, locale, currency) {
  /** Format the "currency" according to each account object */
  // we create object in second argument. inside format() we give a value that we want to format
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency, // get "currency" from each account object 
  }).format(value);
}



const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  // .toFixed(2) => 表示する小数点以降の数を設定。
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    /** Format "time and date" according to each account object */
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);


    /** Format the "currency" according to each account object */
    // we create object in second argument. inside format() we give a value that we want to format
    const formattedMov = formatCur(mov, acc.locale, acc.currency)


    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
      } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  /** Format the "currency" according to each account object */
  // we create object in second argument. inside format() we give a value that we want to format
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency)
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency)

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency)

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency)
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};




const startLogOutTimer = function () {

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0); // cut after comma number, we use padStart(2,0)
    const sec = String(time % 60).padStart(2, 0);  // % = reminder operator

    // 3) in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;


    // 4) When the time is 0 (expired), stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started'
      containerApp.style.opacity = 0;
    }

    // Decrease 1s. each time setInterval function called, decrease 1s
    time--;
  }


  // 1) Set time to 2 minutes
  let time = 120;  // time set

  // 2) call the timer ecery second
  tick(); // call the function immediatelly
  const timer = setInterval(tick, 1000)

  // to clean timer variable, we need to return it here
  return timer;
}


///////////////////////////////////////
// Event handlers
let currentAccount, timer;  // this should be global scope



/** FAKE Always Logged in */
// currentAccount = account1
// updateUI(currentAccount)
// containerApp.style.opacity = 100


// /* Experimenting API
//   new Intl.DateTimeFormat('jp-JP').format():  表示形式を指定の国や言語に切り替えることができる
//   to get other countries code => google ISO language table
// */
// const now = new Date()
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   // month: 'numeric',
//   month: 'long',
//   // month: '2-digit',
//   year: 'numeric',
//   weekday: 'long',
// }
// const locale = navigator.language;  // check my language setting in my browser
// console.log(locale);  // jp
// labelDate.textContent = new Intl.DateTimeFormat('en-GB', options).format(now)


btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount ?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
      }`;
    containerApp.style.opacity = 100;


    // Create current date and time
    /* Experimenting API
    new Intl.DateTimeFormat('jp-JP').format():  表示形式を指定の国や言語に切り替えることができる
    to get other countries code => google ISO language table
    */
    const now = new Date()
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      // month: 'long',
      // month: '2-digit',
      year: 'numeric',
      // weekday: 'long',
    }
    // const locale = navigator.language;  // check my language setting in my browser
    // console.log(locale);  // jp
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const year = now.getFullYear()
    // const hour = now.getHours()
    // const min = now.getMinutes()
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`


    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();


    // Log out timer
    if (timer) clearInterval(timer)
    timer = startLogOutTimer();


    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
      receiverAcc &&
      currentAccount.balance >= amount &&
      receiverAcc ?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());


    // Update UI
    updateUI(currentAccount);


    // Reset timer: When user does someting, then reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();

  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  // to round any value down, we use floor method 小数点を省略するため
  const amount = Math.floor(inputLoanAmount.value);


  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {

    setTimeout(function () {

      // Add movement
      currentAccount.movements.push(amount);

      // Add Loan date
      currentAccount.movementsDates.push(new Date().toISOString());


      // Update UI
      updateUI(currentAccount);

      // Reset timer: When user does someting, then reset the timer
      clearInterval(timer);
      timer = startLogOutTimer();

    }, 2500);

  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES


/**//////////////////////// Numbers, Dates, Intl and Timers  ////////////////////////*/


/** Js represent numbers: in 62 base in 2 format */
console.log(23 === 23.0); // true

// Base 10 - 0 to 9, 1/10 = 0.1,  3/1 0 = 3.33333
// Binary base 2 - 0 1
console.log(0.1 + 0.2); // 0.30000000000000004 
console.log(0.1 + 0.2 === 0.3); // false

/** Convert String to Numbers */
console.log(Number("23"));
console.log(+"23");


/**-------- Parsing ---------
 * parseInt(): Converts A string to an integer.
 * 文字列の引数を解析し、指定された基数 (数学的記数法の底) の整数値を返します
 * parseInt(string [, radix])
 * string: 解析する値。この引数が文字列でない場合、抽象操作 ToString を用いて文字列に変換されます。
 * radix: 2から36までの整数で、string の基数 (数学的記数法の底) を表します。
 *  always working with base 10, so to avoid bugs we pass in number "10"
 */
console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('e23', 10)); // NaN

console.log(Number.parseInt(' 2.5rem ')); // 2
console.log(Number.parseFloat(' 2.5rem ')); // 2.5,　小数点を取得する


/**--------  Number.isFinite: -------
 * BEST way to check if any value is a number
 * Returns true if passed value is finite. 
 * 渡された値が有限数であるかどうかを判断します
*/
console.log(Number.isFinite(20));   // true
console.log(Number.isFinite("20")); // false
console.log(Number.isFinite(+"20X")); // false
console.log(Number.isNaN(23 / 0));  // false


/**------- Number.IsNaN: ---------
 * Number.IsNaN: to check if any value is NOT A NUMBER
*/
console.log(Number.isNaN(20));  // false
console.log(Number.isNaN("20"));  // false
console.log(Number.isNaN(+'20X'));  // true
console.log(Number.isNaN(23 / 0));  // false, dividing with 0 is infinity

console.log(Number.isInteger(23));    // true
console.log(Number.isInteger(23.0));  // true
console.log(Number.isNaN(23 / 0));  // false



/**--------  Math and Rounding -------- */
console.log("////////// Math and Rounding ///////////");

/** Math.sqrt(): ある数の平方根(9の平方根とは「2乗すると9になる数)を返します
 * 
 */
console.log(Math.sqrt(25));   // 5
console.log(25 ** (1 / 2));   // 5
console.log(8 ** (1 / 3));    // 2


console.log('////////// Math.max() /////////');
/** Math.max(): type coersion
 *  returns the largest of the zero or more numbers given as input parameters, or NaN if any parameter isn't a number and can't be converted into one.
 */
console.log(Math.max(5, 19, 23, 34, 0));    // 34
console.log(Math.max(5, 19, 23, '34', 0));  // 34
console.log(Math.max(5, 19, 23, '34px', 0));  // NaN

console.log('////////// Math.min() /////////');
console.log(Math.min(5, 19, 23, 34, 0));    // 0

console.log(Math.PI * Number.parseFloat('10px') ** 2);  //314.1592653589793 

console.log(Math.trunc(Math.random() * 6) + 1);

// To keep random number of range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min
// 0...1 -> 0...(max - min) -> min...max
console.log(randomInt(10, 20));



console.log('////////// Math.round /////////');
/**---------- Rounding intergers --------
 * returns a round number of values
*/
console.log(Math.round(23.3));  // 23
console.log(Math.round(23.9));  // 24

console.log('////////// Math.ceil /////////');
/** Math.ceil(): Returns the smallest integer greater than or equal to its numeric argument. 引数として与えた数以上の最小の整数を返します。*/
console.log(Math.ceil(23.3));  // 24
console.log(Math.ceil(23.9));  // 24

console.log('////////// Math.floor /////////');
/** Math.floor: Returns the greatest integer less than or equal to its numeric argument. 与えられた数値以下の最大の整数を返します */
console.log(Math.floor(23.3));  // 23
console.log(Math.floor('23.9'));  // 23

console.log(Math.trunc(23.3));  // 23

console.log(Math.trunc(-23.3));  // -23
console.log(Math.floor(-23.3));  // -24




console.log('////////// Rounding decimals, toFixed method() /////////');
/** Rounding decimals
 * toFixed method(): Returns always a string representing a number in fixed-point notation.
 */
console.log((2.6).toFixed(0)); // 3(string)
console.log((2.6).toFixed(3));  // 2.600, (3) means that 小数点から３つまで
console.log((2.345).toFixed(2));   // 2.35
// console.log((+'2.345').toFixed(2)); // 2.35 (string)




console.log('////////// Reminder operator /////////');
/** Reminder operator: returns the remider of the division
 * 剰余演算子(%)は、1つ目のオペランドが2つ目のオペランドで除算されたときに残った剰余を返します.　割り算で余った数を返す
 */
console.log(5 % 2); // 1
console.log(5 / 2); // 5 = 2+2+1

console.log(8 % 3); // 8 = 3+3+2
console.log(8 / 3); // 8 = 2+3+2


// even number = 2,4,6,8,10,,,
// odd number = 1,3,5,7,9,,,,
console.log(6 % 2);
console.log(6 / 2); // 3

console.log(7 / 2);
console.log(7 / 2); // 3.5

const isEven = n => n % 2 === 0;
console.log(isEven(8));   // true
console.log(isEven(23));  // false
console.log(isEven(514)); // true


/** .movements__rowをループして、偶数のラインだけオレンジ色にする */
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orange'  // Line 0,2,4,6
    }
    if (i % 3 === 0) {
      row.style.backgroundColor = 'blue'  // Line 0,3,6,9
    }
  })
})





console.log('////////// bigInt /////////');
/** bigInt: it can be used to store numbers as large as we want
 * String、Number、null、undefind、Symbolなどと同じくBigIntもデータ型の一つ
 9007199254740991 is the biggest number that Js can safely represent
 */

// -1 because it starts at 0
console.log(2 ** 53 - 1);   // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(2 ** 53 + 1);   // 9007199254740992
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(12341412352525252525525241414141414123525n);  // 123414141414141414123525n => "n" transform a regular number into a Bigint number
console.log(BigInt(1234141235255)); // this is the same as 'n'

// Operations
console.log(10000n + 10000n);  // 20000n

console.log(12341412352525252525525245n + 1000000n);
// console.log(Math.sqrt(16n));  //  can't convert BigInt to number

const huge = 987171717171717171177189325827582n;
const num = 23;
// console.log(huge * num);  //  can't convert BigInt to number
console.log(huge * BigInt(num));  // 22704949494949494937075354494034386n

// Exceptions
console.log(20n > 15);    // true
console.log(20n === 20);  // false
console.log(20n == 20);  // true
console.log(typeof 20n);  // bigint

console.log(huge + 'is REALLY big number!! '); // 987171717171717171177189325827582is REALLY big number!! 


// Divisions
console.log(10n / 3n);  // 3n
console.log(10 / 3);  // 3.3333333333333335







/**----------------- Dates and times ----------------*/
console.log('----------------- Dates ----------------');
/* Create a Date */
// 1st way
// const now = new Date();
// console.log(now);

// // 2nd way
// console.log(new Date('Mar 10 2021 15:04:32'));
// console.log(new Date('December 24, 2018'));
// console.log(account1.movementsDates[0]);

// // month is based on js is 0
// console.log(new Date(2037, 10, 19, 15, 24, 5)); // Thu Nov 19 2037 15:24:05
// console.log(new Date(2037, 10, 31));  //  Tue Dec 01 2037 
// console.log(new Date(2037, 10, 33));  //  Tue Dec 03 2037 

// console.log(new Date(0)); //  Thu Jan 01 1970
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); //  Sun Jan 04 1970


/** Working wiht Dates */
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());  // 2037
console.log(future.getMonth());  // 10, actually 11
console.log(future.getDate());  // 19
console.log(future.getDay());  // 4 -> Thursday
console.log(future.getHours());  // 15 
console.log(future.getMinutes());  // 23 
console.log(future.getSeconds());  // 0 
console.log(future.toISOString());  // 2037-11-19T14:23:00.000Z
console.log(future.getTime());    // time stampl 2142253380000 milliseconds
console.log(new Date(2142253380000));

// to get current time stamp
console.log(Date.now());  // 1615386184966

// to set the year, month, day, date and so on...
future.setFullYear(2050)
future.setMonth(2)
future.setDate(28)    //  Mon Mar 28 2050
console.log(future);  //  Mon Mar 28 2050 


/** Operations with Date */
const future2 = new Date(2037, 10, 19, 15, 23);
console.log(+future);


// date2 is later
// 24: a day has 24h, 1h is 60 min, 1min is 60s, 1s is 1000ms
// when we pass ealier date in date2 than date1 argument, then returns a minus, so to avoid this minus, we set Math.abs
const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24))
console.log(days1); // 864000000

// 2) and then we convert 864000000 to days => 10 days




/**------------------ Internasionalising API ------------------*/
/**---------  new Intl.DateTimeFormat('jp-JP').format():------------*/
/* 表示形式を指定の国や言語に切り替えることができる
  new Intl.DateTimeFormat('jp-JP').format():  表示形式を指定の国や言語に  切り替えることができる
  to get other countries code => google ISO language table
*/


/**------------------  Internasionalising Number ------------------*/
const num2 = 182718374.65

const options2 = {
  style: 'currency',  // 3 styles = unit, percent, currency(need to set this in property)
  // unit: 'mile-per-hour',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false,
}


console.log('US: ', new Intl.NumberFormat('en-US', options2).format(num2)); // US:  182,718,374.65

console.log('Germany: ', new Intl.NumberFormat('de-DE', options2).format(num2));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options2).format(num2));
console.log(navigator.language, new Intl.NumberFormat(navigator.language, options2).format(num2));






/**---------------- setTimeout and setInterval ---------------*/
console.log('---------------- setTimeout and setInterval -------------');

const ingrediesnts = ['olives', 'spinach']

// Callback function execute only once in setTimeout fucntion
const pizzaTimer = setTimeout((ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕 After reloading in 3 seconds, this shows in the console.`),
  3000,
  ...ingrediesnts,
  // 'olives',   // olives passes into argument ing1
  // 'spinach'   // spinach passes into argument ing1
);
console.log('waiting....');

// To clear setTimeout() method, we use "clearTimeout(pizzaTimer)"
if (ingrediesnts.includes('spinach')) clearTimeout(pizzaTimer);



// setInterval function: it is executed in every seconds/minutes that we pass in
setInterval(function () {
  const now3 = new Date();
  // console.log(now3);
}, 1000)