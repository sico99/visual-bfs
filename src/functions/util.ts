export const randomLetter = () => {
    // Random character code between 65 and 90
    const offset = Math.floor(Math.random() * 25)

    return String.fromCharCode(65 + offset)
}