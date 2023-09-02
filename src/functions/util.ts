export const randomLetter = () => {
    // Random character code between 65 and 90
    const offset = Math.floor(Math.random() * 25)

    return String.fromCharCode(65 + offset)
}

export const randomWord = (): Promise<string> => {
    const api = 'https://random-words-api.vercel.app/word/adjective'
    return new Promise( (resolve, reject) => {
        fetch(api)
            .then(response => {
                if (response.status >= 200 && response.status < 300){
                   return response.json()
                } else  
                    reject('Failed to quey API Status:'+response.status)
            })
            .then( data => {
                if (data.length){
                    resolve(data[0].word)
                } else {
                    reject('No word returned')
                }
            })
            .catch(error => reject(error))
    })

}

export const getDefinition = (word: string) => {
    const api = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + word
    return new Promise( (resolve, reject) => {
        fetch(api)
            .then(response => {
                if (response.status >= 200 && response.status < 300){
                   return response.json()
                } else  
                    reject('Failed to quey API Status:'+response.status)
            })
            .then( data => {
                console.log(data);
                
                if (data.length){
                    resolve(data[0].meanings[0].definitions[0])
                } else {
                    reject('No word returned')
                }
            })
            .catch(error => reject(error))
    })
}