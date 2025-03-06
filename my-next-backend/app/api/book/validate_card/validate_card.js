// api/book/validate_card
export function validateCardNumber(cardNumber) {
    cardNumber = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let alternate = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let n = parseInt(cardNumber[i], 10);
        if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
    }
    return (sum % 10 === 0);
}

export function validateExpiryDate(expiryDate) {
    const [month, year] = expiryDate.split("/").map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    return (year > currentYear || (year === currentYear && month >= currentMonth));
}

export function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv); // check if cvv is 3-4 digit
}
