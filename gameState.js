// gameState.js
export const gameState = {
    hasExorcistInherited: false, 
    hasKey2F: false,             
    hasModelGun: false,          
    hasMetGrandma: false,        
    hasExperiencedFirstEncounter: false, // 初回強制エンカウントフラグ
    cards: [],                   
    equippedCards: [],           
    
    // 主人公ステータス
    level: 1,                    
    exp: 0,                      
    hp: 100,                     
    maxHp: 100,                  
    def: 5,                      
    agi: 5,                      
    sin: 0,                      
    money: 0,                    
    familiarSync: 7              
};