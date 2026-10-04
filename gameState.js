// gameState.js
export const gameState = {
    hasExorcistInherited: false, 
    hasKey2F: false,             
    hasModelGun: false,          
    hasMetGrandma: false,        
    hasExperiencedFirstEncounter: false,
    cards: [],                   
    equippedCards: [],           
    
    // ★ アイテム所持枠を追加（アイテムIDとその個数を記録）
    inventory: {}, // 例: { coffee: 2, umbrella_blue: 1 }
    
    level: 1,                    
    exp: 0,                      
    hp: 20,                      
    maxHp: 20,                  
    def: 5,                      
    agi: 5,                      
    sin: 0,                      
    money: 0,                    
    familiarSync: 7              
};