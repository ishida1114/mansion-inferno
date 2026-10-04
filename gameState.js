// gameState.js
export const gameState = {
    hasExorcistInherited: false, 
    hasKey2F: false,             
    hasModelGun: false,          
    hasMetGrandma: false,        
    hasExperiencedFirstEncounter: false,
    cards: [],                   
    equippedCards: [],           
    
    // 主人公ステータス（ホラー死にゲー仕様）
    level: 1,                    
    exp: 0,                      
    hp: 20,                      // ★ 初期HPを 20 に設定（雑魚の攻撃で即死圏内）
    maxHp: 20,                  
    def: 5,                      
    agi: 5,                      
    sin: 0,                      
    money: 0,                    
    familiarSync: 7              
};