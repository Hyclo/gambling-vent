import random as r

bet = 5
multiplier = 3.92

def run():
    money = 100
    
    for i in range(100):
        chance = r.randint(1, 4)
        money -= bet
        
        if chance in [1] :
            money += bet * multiplier
            
    return money


for i in range(10):
    wins = 0
    losses = 0
    
    for i in range(10_000):
        result = run()
        
        if result > 100:
            wins += 1
        else:
            losses += 1

    print(f"Wins: {wins}")
    print(f"Losses: {losses}")

