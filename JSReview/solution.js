const parseJSON = async() => {
    const res = await fetch("./recipes.json");
    const obj = await res.json();
    
    let recipes = obj.recipes;
    
    console.log(recipes);

    recipes.map(() => {
        
    })
}

parseJSON();