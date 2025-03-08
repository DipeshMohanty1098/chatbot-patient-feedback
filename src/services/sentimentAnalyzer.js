export async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
        {
            method: "POST",
            headers: {
                //Authorization: `Bearer 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`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({inputs: "Today is garbage"}).then((response) => {
    console.log(response);
});
