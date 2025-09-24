function getRankInfo(recipe, chef) {

    var times = Number.MAX_VALUE;

    if (recipe.stirfry > 0) {
        times = Math.min(times, chef.stirfryVal / recipe.stirfry);
    }
    if (recipe.boil > 0) {
        times = Math.min(times, chef.boilVal / recipe.boil);
    }
    if (recipe.knife > 0) {
        times = Math.min(times, chef.knifeVal / recipe.knife);
    }
    if (recipe.fry > 0) {
        times = Math.min(times, chef.fryVal / recipe.fry);
    }
    if (recipe.bake > 0) {
        times = Math.min(times, chef.bakeVal / recipe.bake);
    }
    if (recipe.steam > 0) {
        times = Math.min(times, chef.steamVal / recipe.steam);
    }

    var rankInfo = {};

    var rankAddition = 0;
    var rankDisp = "-";
    var rankVal = 0;

    if (times != Number.MAX_VALUE) {
        if (times >= 5) {
            rankAddition = 100;
            rankDisp = "传";
            rankVal = 5;
        } else if (times >= 4) {
            rankAddition = 50;
            rankDisp = "神";
            rankVal = 4;
        } else if (times >= 3) {
            rankAddition = 30;
            rankDisp = "特";
            rankVal = 3;
        } else if (times >= 2) {
            rankAddition = 10;
            rankDisp = "优";
            rankVal = 2;
        } else if (times >= 1) {
            rankAddition = 0;
            rankDisp = "可";
            rankVal = 1;
        }
    }

    rankInfo["rankAddition"] = rankAddition;
    rankInfo["rankDisp"] = rankDisp;
    rankInfo["rankVal"] = rankVal;

    return rankInfo;
}

function getRecipeAddition(effects, chef, recipes, recipe, quantity, rule) {
    var price = 0;
    var basic = new Addition();

    for (var i in effects) {
        var effect = effects[i];
        var condition = checkSkillCondition(effect, chef, recipes, recipe, quantity, null);
        if (condition.pass) {
            if (isRecipePriceAddition(effect, recipe, rule)) {
                price += effect.value * condition.count;
            }

            if (isRecipeBasicAddition(effect, recipe)) {
                addEffectAddition(basic, effect, condition.count);
            }
        }
    }

    var result = {};
    result["price"] = price;
    result["basic"] = basic;
    return result;
}

function isRecipePriceAddition(effect, recipe, rule) {
    var type = effect.type;
    if (type == "UseAll") {
        if (recipe.rarity == effect.rarity) {
            return true;
        }
    } else if (type == "UseFish") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "池塘") {
                return true;
            }
        }
    } else if (type == "UseCreation") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "作坊") {
                return true;
            }
        }
    } else if (type == "UseMeat") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "牧场"
                || recipe.materials[m].origin == "鸡舍"
                || recipe.materials[m].origin == "猪圈") {
                return true;
            }
        }
    } else if (type == "UseVegetable") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "菜棚"
                || recipe.materials[m].origin == "菜地"
                || recipe.materials[m].origin == "森林") {
                return true;
            }
        }
    } else if (type == "UseStirfry") {
        if (recipe.stirfry > 0) {
            return true;
        }
    } else if (type == "UseBoil") {
        if (recipe.boil > 0) {
            return true;
        }
    } else if (type == "UseFry") {
        if (recipe.fry > 0) {
            return true;
        }
    } else if (type == "UseKnife") {
        if (recipe.knife > 0) {
            return true;
        }
    } else if (type == "UseBake") {
        if (recipe.bake > 0) {
            return true;
        }
    } else if (type == "UseSteam") {
        if (recipe.steam > 0) {
            return true;
        }
    } else if (type == "UseSweet") {
        if (recipe.condiment == "Sweet") {
            return true;
        }
    } else if (type == "UseSour") {
        if (recipe.condiment == "Sour") {
            return true;
        }
    } else if (type == "UseSpicy") {
        if (recipe.condiment == "Spicy") {
            return true;
        }
    } else if (type == "UseSalty") {
        if (recipe.condiment == "Salty") {
            return true;
        }
    } else if (type == "UseBitter") {
        if (recipe.condiment == "Bitter") {
            return true;
        }
    } else if (type == "UseTasty") {
        if (recipe.condiment == "Tasty") {
            return true;
        }
    } else if (type == "Gold_Gain") {
        if (!rule || rule.Id == 0 || rule.Satiety || rule.IsActivity) {
            return true;
        }
    } else if (type == "CookbookPrice") {
        return true;
    }

    return false;
}

function isRecipeBasicAddition(effect, recipe) {
    var type = effect.type;
    if (type == "BasicPrice") {
        return true;
    } else if (type == "BasicPriceUseFish") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "池塘") {
                return true;
            }
        }
    } else if (type == "BasicPriceUseCreation") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "作坊") {
                return true;
            }
        }
    } else if (type == "BasicPriceUseMeat") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "牧场"
                || recipe.materials[m].origin == "鸡舍"
                || recipe.materials[m].origin == "猪圈") {
                return true;
            }
        }
    } else if (type == "BasicPriceUseVegetable") {
        for (var m in recipe.materials) {
            if (recipe.materials[m].origin == "菜棚"
                || recipe.materials[m].origin == "菜地"
                || recipe.materials[m].origin == "森林") {
                return true;
            }
        }
    } else if (type == "BasicPriceUseStirfry") {
        if (recipe.stirfry > 0) {
            return true;
        }
    } else if (type == "BasicPriceUseBoil") {
        if (recipe.boil > 0) {
            return true;
        }
    } else if (type == "BasicPriceUseFry") {
        if (recipe.fry > 0) {
            return true;
        }
    } else if (type == "BasicPriceUseKnife") {
        if (recipe.knife > 0) {
            return true;
        }
    } else if (type == "BasicPriceUseBake") {
        if (recipe.bake > 0) {
            return true;
        }
    } else if (type == "BasicPriceUseSteam") {
        if (recipe.steam > 0) {
            return true;
        }
    } else if (type == "BasicPriceUseSweet") {
        if (recipe.condiment == "Sweet") {
            return true;
        }
    } else if (type == "BasicPriceUseSour") {
        if (recipe.condiment == "Sour") {
            return true;
        }
    } else if (type == "BasicPriceUseSpicy") {
        if (recipe.condiment == "Spicy") {
            return true;
        }
    } else if (type == "BasicPriceUseSalty") {
        if (recipe.condiment == "Salty") {
            return true;
        }
    } else if (type == "BasicPriceUseBitter") {
        if (recipe.condiment == "Bitter") {
            return true;
        }
    } else if (type == "BasicPriceUseTasty") {
        if (recipe.condiment == "Tasty") {
            return true;
        }
    }
    return false;
}

function getMaterialsAddition(recipe, materials) {
    var addition = 0;

    for (var m in recipe.materials) {
        for (var n in materials) {
            if (recipe.materials[m].material == materials[n].materialId) {
                if (materials[n].addition) {
                    addition += Number(materials[n].addition);
                    break;
                }
            }
        }
    }
    return +addition.toFixed(2);
}

function buildRecipeMenu(recipe) {
    var result = [];
    var item = {};
    item["data"] = recipe;
    result.push(item);
    return result;
}

function getPercentDisp(percent) {
    if (percent != 0) {
        return percent.toString() + "%";
    } else {
        return "";
    }
}

function getAbsDisp(abs) {
    if (abs == 0) {
        return "";
    } else {
        return abs.toString();
    }
}

function calMaterialReduce(chef, materialId, quantity) {
    if (chef && chef.materialEffects) {
        var addtion = new Addition();
        for (var i in chef.materialEffects) {
            var effect = chef.materialEffects[i];
            if (effect.conditionType == "MaterialReduce") {
                if (effect.conditionValueList.indexOf(materialId) >= 0) {
                    setAddition(addtion, effect);
                }
            }
        }
        quantity = Math.ceil(calReduce(quantity, addtion))
        return quantity > 1 ? quantity : 1;
    }
    return quantity;
}

function calReduce(value, addition) {
    return +((value - addition.abs) * (1 - addition.percent / 100)).toFixed(2);
}

function getRecipeQuantity(recipe, materials, rule, chef) {
    var quantity = 1;
    if (!rule.hasOwnProperty("DisableMultiCookbook") || rule.DisableMultiCookbook == false) {
        quantity = recipe.limitVal;

        if (chef) {
            for (var i in chef.maxLimitEffect) {
                if (chef.maxLimitEffect[i].rarity == recipe.rarity) {
                    quantity += chef.maxLimitEffect[i].value;
                }
            }
        }
    }

    for (var m in recipe.materials) {
        var exist = false;
        for (var n in materials) {
            if (recipe.materials[m].material == materials[n].materialId) {
                exist = true;
                if (Number.isInteger(parseInt(materials[n].quantity))) {
                    var mQuantity = calMaterialReduce(chef, recipe.materials[m].material, recipe.materials[m].quantity);
                    var tt = Math.floor(materials[n].quantity / mQuantity);
                    if (tt < quantity) {
                        quantity = tt;
                    }
                }
                break;
            }
        }
        if (!exist) {
            return 0;
        }
    }

    if (quantity < 0) {
        return 0;
    }

    return quantity;
}

function getRecipeResult(chef, equip, recipe, quantity, maxQuantity, materials, rule, decoration, condiment, forCal, recipes, partialRecipeAdds, intents) {

    var resultData = {};

    var rankAddition = 0;
    var chefSkillAddition = 0;
    var equipSkillAddition = 0;
    var decorationAddition = 0;
    var bonusAddition = 0;
    var condimentSkillAddition = 0;

    var basicAddition = new Addition();
    var partialAddition = 0;

    if (chef && chef.chefId) {
        var rankData = getRankInfo(recipe, chef);
        resultData["rankVal"] = rankData.rankVal;
        resultData["rankDisp"] = rankData.rankDisp;

        if (!forCal && rankData.rankVal == 0) {
            return resultData;
        }

        if (!rule || !rule.hasOwnProperty("DisableCookbookRank") || rule.DisableCookbookRank == false) {
            rankAddition = rankData.rankAddition;
        }

        resultData["rankAdditionDisp"] = getPercentDisp(rankAddition);

        if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
            var specialSkillAdds = getRecipeAddition(chef.specialSkillEffect, chef, recipes, recipe, quantity, rule);
            chefSkillAddition += specialSkillAdds.price;
            addAddition(basicAddition, specialSkillAdds.basic);

            var selfUltimateAdds = getRecipeAddition(chef.selfUltimateEffect, chef, recipes, recipe, quantity, rule);
            chefSkillAddition += selfUltimateAdds.price;
            addAddition(basicAddition, selfUltimateAdds.basic);

            if (partialRecipeAdds) {
                for (var i in partialRecipeAdds) {
                    var effect = partialRecipeAdds[i].effect;
                    if (isRecipePriceAddition(effect, recipe, rule)) {
                        partialAddition += effect.value * partialRecipeAdds[i].count;
                    }

                    if (isRecipeBasicAddition(effect, recipe)) {
                        addEffectAddition(basicAddition, effect, partialRecipeAdds[i].count);
                    }
                }
            }
        }

        for (var i in chef.disk.ambers) {
            var amber = chef.disk.ambers[i].data;
            if (amber) {
                var amberAdds = getRecipeAddition(amber.allEffect[chef.disk.level - 1], chef, recipes, recipe, quantity, rule);
                chefSkillAddition += amberAdds.price;
                addAddition(basicAddition, amberAdds.basic);
            }
        }

        resultData["chefSkillAdditionDisp"] = getPercentDisp(chefSkillAddition);

        if (!rule || !rule.hasOwnProperty("DisableEquipSkillEffect") || rule.DisableEquipSkillEffect == false) {
            if (equip && equip.effect) {
                var equipEffect = updateEquipmentEffect(equip.effect, chef.selfUltimateEffect);
                var equipSkillAdds = getRecipeAddition(equipEffect, chef, recipes, recipe, quantity, rule);
                equipSkillAddition = equipSkillAdds.price;
                addAddition(basicAddition, equipSkillAdds.basic);
            }
        }
        resultData["equipSkillAdditionDisp"] = getPercentDisp(equipSkillAddition);

        bonusAddition = bonusAddition + Number(chef.addition);
    }

    resultData["satiety"] = recipe.rarity;
    if (intents) {
        var mIntentAddition = 0;
        for (var i in intents) {
            var type = intents[i].effectType;
            var value = intents[i].effectValue;
            if (type == "IntentAdd") {
                mIntentAddition += value;
            }
        }

        var intentBasicAddition = new Addition();
        var intentPriceAddition = 0;
        var satietyAddition = new Addition();

        for (var i in intents) {
            var isBuff = intents[i].buffId;
            var type = intents[i].effectType;
            var value = intents[i].effectValue;
            if (type == "BasicPriceChange") {
                if (!isBuff) {
                    value = value * (1 + (mIntentAddition * 0.01));
                }
                intentBasicAddition.abs += value;
            } else if (type == "BasicPriceChangePercent") {
                if (!isBuff) {
                    value = value * (1 + (mIntentAddition * 0.01));
                }
                intentBasicAddition.percent += value;
            } else if (type == "SatietyChange") {
                if (!isBuff) {
                    value = value * (1 + (mIntentAddition * 0.01));
                }
                satietyAddition.abs += value;
            } else if (type == "SatietyChangePercent") {
                if (!isBuff) {
                    value = value * (1 + (mIntentAddition * 0.01));
                }
                satietyAddition.percent += value;
            } else if (type == "SetSatietyValue") {
                resultData.satiety = value;
            } else if (type == "PriceChangePercent") {
                if (!isBuff) {
                    value = value * (1 + (mIntentAddition * 0.01));
                }
                intentPriceAddition += value;
            }
        }

        basicAddition.abs += intentBasicAddition.abs;
        basicAddition.percent += intentBasicAddition.percent;

        bonusAddition += intentPriceAddition / 100;
        resultData.satiety = Math.ceil(calAddition(resultData.satiety, satietyAddition));
    }

    resultData["partialAdditionDisp"] = getPercentDisp(partialAddition);
    resultData["basicPercentDisp"] = getPercentDisp(basicAddition.percent);
    resultData["basicAbsDisp"] = getAbsDisp(basicAddition.abs);

    if (!rule || !rule.hasOwnProperty("DisableCondimentEffect") || rule.DisableCondimentEffect == false) {
        if (condiment) {
            resultData["useCondiment"] = true;
            var condimentSkillAdds = getRecipeAddition(condiment.effect, chef, recipes, recipe, quantity, rule);
            condimentSkillAddition = condimentSkillAdds.price;
        }
    }
    resultData["condimentSkillAdditionDisp"] = getPercentDisp(condimentSkillAddition);

    if (!rule || !rule.hasOwnProperty("DisableDecorationEffect") || rule.DisableDecorationEffect == false) {
        if (decoration) {
            decorationAddition = decoration;
        }
    }
    resultData["decorationAdditionDisp"] = getPercentDisp(decorationAddition);

    bonusAddition = bonusAddition + Number(recipe.addition);

    if (rule && rule.hasOwnProperty("MaterialsEffect")) {
        var materialsAddition = getMaterialsAddition(recipe, materials);
        bonusAddition = bonusAddition + materialsAddition;
    }

    var priceAddition = (rankAddition + chefSkillAddition + equipSkillAddition + condimentSkillAddition + decorationAddition + recipe.ultimateAddition + partialAddition) / 100;
    var basicPrice = calAddition(recipe.price, basicAddition);
    if (!intents) {
        basicPrice = Math.floor(basicPrice);
    }

    resultData["data"] = recipe;
    resultData["quantity"] = quantity;
    resultData["max"] = maxQuantity;
    resultData["limit"] = quantity;
    resultData["bonusAdditionDisp"] = getPercentDisp(+(bonusAddition * 100).toFixed(2));
    resultData["totalPrice"] = recipe.price * quantity;
    resultData["realPrice"] = Math.ceil(+(basicPrice * (1 + priceAddition)).toFixed(2));
    var score = Math.ceil(+(basicPrice * (1 + priceAddition + bonusAddition)).toFixed(2));
    resultData["bonusScore"] = score - resultData.realPrice;
    resultData["totalBonusScore"] = resultData.bonusScore * quantity;
    resultData["score"] = score;
    resultData["totalScore"] = score * quantity;
    resultData["totalTime"] = recipe.time * quantity;
    resultData["totalTimeDisp"] = secondsToTime(resultData.totalTime);

    var efficiency = Math.floor(resultData.realPrice * 3600 / recipe.time);
    resultData["efficiency"] = efficiency;

    var chefEff = 0;
    if (chef && resultData.rankVal > 0) {
        chefEff = efficiency;
    }
    resultData["chefEff"] = chefEff;

    return resultData;
}

function calAddition(value, addition) {
    return +((value + addition.abs) * (1 + addition.percent / 100)).toFixed(2);
}

function getTimeAddition(effects) {
    var addition = 0;
    for (var k in effects) {
        if (effects[k].type == "OpenTime") {
            addition += effects[k].value;
        }
    }
    return +addition.toFixed(2);
}

function updateEquipmentEffect(effect, selfUltimateEffect) {
    var result = effect;
    for (var i in selfUltimateEffect) {
        if (selfUltimateEffect[i].type == "MutiEquipmentSkill") {
            result = JSON.parse(JSON.stringify(effect));
            for (var j in result) {
                var equipAddtion = new Addition();
                setAddition(equipAddtion, selfUltimateEffect[i]);
                result[j].value = calAddition(result[j].value, equipAddtion);
            }
        }
    }
    return result;
}

function setAddition(addition, effect) {
    if (effect.cal == "Abs") {
        addition.abs = +(addition.abs + effect.value).toFixed(2);
    } else if (effect.cal == "Percent") {
        addition.percent = +(addition.percent + effect.value).toFixed(2);
    }
}

function addEffectAddition(addition, effect, count) {
    if (effect.cal == "Abs") {
        addition.abs += effect.value * count;
    } else if (effect.cal == "Percent") {
        addition.percent += effect.value * count;
    }
}

function addAddition(addition, add) {
    addition.abs += add.abs;
    addition.percent += add.percent;
}

function Addition() {
    this.abs = 0;
    this.percent = 0;
}

function secondsToTime(sec) {
    sec = Number(sec);

    var d = Math.floor(sec / 3600 / 24);
    var h = Math.floor(sec / 3600 % 24);
    var m = Math.floor(sec / 60 % 60);
    var s = Math.floor(sec % 60);

    var ret = "";
    if (d > 0) {
        ret += d + "天";
    }
    if (h > 0) {
        ret += h + "小时";
    }
    if (m > 0) {
        ret += m + "分";
    }
    if (s > 0) {
        ret += s + "秒";
    }

    return ret;
}

function getEquipInfo(equipId, equips) {
    var info = null;
    if (equipId) {
        for (var j in equips) {
            if (equipId == equips[j].equipId) {
                return equips[j];
            }
        }
    }
    return info;
}

function getCondimentInfo(condimentId, condiments) {
    var info = null;
    if (condimentId) {
        for (var j in condiments) {
            if (condimentId == condiments[j].condimentId) {
                return condiments[j];
            }
        }
    }
    return info;
}

function setDataForChef(chef, equip, useEquip, globalUltimateEffect, partialChefAdds, selfUltimateEffect, activityUltimateEffect, showFinal, rule, useAmber) {

    var stirfryAddition = new Addition();
    var boilAddition = new Addition();
    var knifeAddition = new Addition();
    var fryAddition = new Addition();
    var bakeAddition = new Addition();
    var steamAddition = new Addition();

    var meatAddition = 0;
    var creationAddition = 0;
    var vegAddition = 0;
    var fishAddition = 0;

    var sweetAddition = new Addition();
    var sourAddition = new Addition();
    var spicyAddition = new Addition();
    var saltyAddition = new Addition();
    var bitterAddition = new Addition();
    var tastyAddition = new Addition();

    var maxLimitEffect = [];
    var materialEffects = [];

    var effects = [];

    chef["selfUltimateEffect"] = [];

    if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
        effects = effects.concat(chef.specialSkillEffect);
        effects = effects.concat(globalUltimateEffect);

        if (selfUltimateEffect) {
            for (var i in selfUltimateEffect) {
                if (chef.chefId == selfUltimateEffect[i].chefId) {
                    chef.selfUltimateEffect = selfUltimateEffect[i].effect;
                    effects = effects.concat(selfUltimateEffect[i].effect);
                    break;
                }
            }
        }

        if (partialChefAdds) {
            for (var i in partialChefAdds) {
                var condition = checkSkillCondition(partialChefAdds[i], chef, null, null, null, null);
                if (condition.pass) {
                    effects = effects.concat(partialChefAdds[i]);
                }
            }
        }
    }

    if (!rule || !rule.hasOwnProperty("DisableEquipSkillEffect") || rule.DisableEquipSkillEffect == false) {
        if (useEquip && equip && equip.effect) {
            var equipEffect = updateEquipmentEffect(equip.effect, chef.selfUltimateEffect);
            effects = effects.concat(equipEffect);
        }
    }

    if (activityUltimateEffect) {
        effects = effects.concat(activityUltimateEffect);
    }

    if (useAmber) {
        for (var i in chef.disk.ambers) {
            var amber = chef.disk.ambers[i].data;
            if (amber) {
                effects = effects.concat(amber.allEffect[chef.disk.level - 1]);
            }
        }
    }

    for (var i in effects) {
        var type = effects[i].type;
        var tag = effects[i].tag;

        if (tag && chef.tags.indexOf(tag) < 0) {
            continue;
        }

        if (type == "Stirfry") {
            setAddition(stirfryAddition, effects[i]);
        } else if (type == "Boil") {
            setAddition(boilAddition, effects[i]);
        } else if (type == "Knife") {
            setAddition(knifeAddition, effects[i]);
        } else if (type == "Fry") {
            setAddition(fryAddition, effects[i]);
        } else if (type == "Bake") {
            setAddition(bakeAddition, effects[i]);
        } else if (type == "Steam") {
            setAddition(steamAddition, effects[i]);
        } else if (type == "Meat") {
            meatAddition += effects[i].value;
        } else if (type == "Creation") {
            creationAddition += effects[i].value;
        } else if (type == "Vegetable") {
            vegAddition += effects[i].value;
        } else if (type == "Fish") {
            fishAddition += effects[i].value;
        } else if (type == "Sweet") {
            setAddition(sweetAddition, effects[i]);
        } else if (type == "Sour") {
            setAddition(sourAddition, effects[i]);
        } else if (type == "Spicy") {
            setAddition(spicyAddition, effects[i]);
        } else if (type == "Salty") {
            setAddition(saltyAddition, effects[i]);
        } else if (type == "Bitter") {
            setAddition(bitterAddition, effects[i]);
        } else if (type == "Tasty") {
            setAddition(tastyAddition, effects[i]);
        } else if (type == "MaxEquipLimit" && (effects[i].condition == "Self" || effects[i].condition == "Partial")) {
            maxLimitEffect = maxLimitEffect.concat(effects[i]);
        } else if (type == "MaterialReduce" && effects[i].condition == "Self") {
            materialEffects = materialEffects.concat(effects[i]);
        }
    }

    chef["meatVal"] = chef.meat + meatAddition;
    chef["creationVal"] = chef.creation + creationAddition;
    chef["vegVal"] = chef.veg + vegAddition;
    chef["fishVal"] = chef.fish + fishAddition;

    chef["meatDisp"] = getAtrributeDisp(chef.meatVal, chef.meat, showFinal);
    chef["creationDisp"] = getAtrributeDisp(chef.creationVal, chef.creation, showFinal);
    chef["vegDisp"] = getAtrributeDisp(chef.vegVal, chef.veg, showFinal);
    chef["fishDisp"] = getAtrributeDisp(chef.fishVal, chef.fish, showFinal);

    chef["stirfryVal"] = Math.ceil(calAddition(chef.stirfry, stirfryAddition));
    chef["boilVal"] = Math.ceil(calAddition(chef.boil, boilAddition));
    chef["knifeVal"] = Math.ceil(calAddition(chef.knife, knifeAddition));
    chef["fryVal"] = Math.ceil(calAddition(chef.fry, fryAddition));
    chef["bakeVal"] = Math.ceil(calAddition(chef.bake, bakeAddition));
    chef["steamVal"] = Math.ceil(calAddition(chef.steam, steamAddition));

    chef["stirfryDisp"] = getAtrributeDisp(chef.stirfryVal, chef.stirfry, showFinal);
    chef["boilDisp"] = getAtrributeDisp(chef.boilVal, chef.boil, showFinal);
    chef["knifeDisp"] = getAtrributeDisp(chef.knifeVal, chef.knife, showFinal);
    chef["fryDisp"] = getAtrributeDisp(chef.fryVal, chef.fry, showFinal);
    chef["bakeDisp"] = getAtrributeDisp(chef.bakeVal, chef.bake, showFinal);
    chef["steamDisp"] = getAtrributeDisp(chef.steamVal, chef.steam, showFinal);

    chef["sweetVal"] = Math.ceil(calAddition(chef.sweet, sweetAddition));
    chef["sourVal"] = Math.ceil(calAddition(chef.sour, sourAddition));
    chef["spicyVal"] = Math.ceil(calAddition(chef.spicy, spicyAddition));
    chef["saltyVal"] = Math.ceil(calAddition(chef.salty, saltyAddition));
    chef["bitterVal"] = Math.ceil(calAddition(chef.bitter, bitterAddition));
    chef["tastyVal"] = Math.ceil(calAddition(chef.tasty, tastyAddition));

    chef["sweetDisp"] = getAtrributeDisp(chef.sweetVal, chef.sweet, showFinal);
    chef["sourDisp"] = getAtrributeDisp(chef.sourVal, chef.sour, showFinal);
    chef["spicyDisp"] = getAtrributeDisp(chef.spicyVal, chef.spicy, showFinal);
    chef["saltyDisp"] = getAtrributeDisp(chef.saltyVal, chef.salty, showFinal);
    chef["bitterDisp"] = getAtrributeDisp(chef.bitterVal, chef.bitter, showFinal);
    chef["tastyDisp"] = getAtrributeDisp(chef.tastyVal, chef.tasty, showFinal);

    chef["maxLimitEffect"] = maxLimitEffect;
    chef["materialEffects"] = materialEffects;
}

function getAtrributeDisp(final, origin, showFinal) {
    var disp = "";
    if (showFinal) {
        if (final) {
            disp = final;
        }
        return disp;
    }
    if (origin) {
        disp += origin;
    }
    var add = final - origin;
    if (add) {
        if (add > 0) {
            disp += "+";
        }
        disp += add;
    }
    return disp;
}

function getRarityDisp(rarity) {
    var rarityDisp = "";
    for (var j = 0; j < rarity; j++) {
        rarityDisp += "&#x2605;";
    }
    return rarityDisp;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isChefAddType(type) {
    if (type == "Stirfry"
        || type == "Boil"
        || type == "Knife"
        || type == "Fry"
        || type == "Bake"
        || type == "Steam"
        || type == "MaxEquipLimit") {
        return true;
    } else {
        return false;
    }
}

function getCustomRound(rule) {
    if (rule.Satiety) {
        return rule.IntentList.length;
    } else {
        return 3;
    }
}

function getPartialRecipeAdds(customData, skills, rule) {
    var round = getCustomRound(rule);
    var partialAdds = [];
    for (var o = 0; o < round * 3; o++) {
        partialAdds.push([]);
    }

    for (var i in customData) {
        var chef = customData[i].chef;
        if (chef.chefId && rule.calPartialChefIds.indexOf(chef.chefId) >= 0) {
            for (var k in skills) {
                var skill = skills[k];
                if (chef.ultimateSkill == skill.skillId) {
                    var recipes = customData[i].recipes;
                    for (var m in skill.effect) {
                        var effect = skill.effect[m];
                        if (effect.condition == "Partial") {
                            if (!effect.conditionType || effect.conditionType == "PerRank" || effect.conditionType == "SameSkill" 
                                || effect.conditionType == "PerSkill") {
                                var condition = checkSkillCondition(effect, chef, recipes, null, null, customData);
                                if (condition.pass) {
                                    var add = {};
                                    add["effect"] = effect;
                                    add["count"] = condition.count;
                                    var startIndex = 0;
                                    if (rule.Satiety) {
                                        startIndex = Number(i) * 3;
                                    }
                                    for (var o = startIndex; o < round * 3; o++) {
                                        partialAdds[o].push(add);
                                    }
                                }
                            } else {
                                for (var j in customData) {
                                    if (rule.Satiety) {
                                        if (j < i) {
                                            continue;
                                        }
                                    }
                                    var startIndex = Number(j) * 3;
                                    for (var g in customData[j].recipes) {
                                        var condition = checkSkillCondition(effect, customData[j].chef, null, customData[j].recipes[g].data, customData[j].recipes[g].quantity, null);
                                        if (condition.pass) {
                                            var add = {};
                                            add["effect"] = effect;
                                            add["count"] = condition.count;
                                            partialAdds[startIndex + Number(g)].push(add);
                                        }
                                    }
                                }
                            }
                        } else if (effect.condition == "Next" && Number(i) < round - 1) {
                            var condition = checkSkillCondition(effect, chef, recipes, null, null, null);
                            if (condition.pass) {
                                var add = {};
                                add["effect"] = effect;
                                add["count"] = condition.count;
                                var startIndex = Number(i) * 3 + 3;
                                for (var o = 0; o < 3; o++) {
                                    partialAdds[startIndex + o].push(add);
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    return partialAdds;
}

function checkSkillCondition(effect, chef, recipes, recipe, quantity, customData) {
    var result = {};
    result["pass"] = true;
    result["count"] = 1;

    if (!effect.conditionType) {
        return result;
    }

    if (effect.conditionType == "Rank") {
        if (recipe && chef && chef.chefId) {
            var rankData = getRankInfo(recipe, chef);
            if (rankData.rankVal >= effect.conditionValue) {
                return result;
            }
        }
    } else if (effect.conditionType == "PerRank") {
        var count = 0;
        for (var i in recipes) {
            var oneRecipe = recipes[i];
            if (oneRecipe.data) {
                var rankData = getRankInfo(oneRecipe.data, chef);
                if (rankData.rankVal >= effect.conditionValue) {
                    count++;
                }
            }
        }
        if (count > 0) {
            result.count = count;
            return result;
        }
    } else if (effect.conditionType == "ExcessCookbookNum") {
        if (recipe) {
            if (quantity >= effect.conditionValue) {
                return result;
            }
        }
    } else if (effect.conditionType == "FewerCookbookNum") {
        if (recipe) {
            if (quantity <= effect.conditionValue) {
                return result;
            }
        }
    } else if (effect.conditionType == "CookbookRarity") {
        if (recipe) {
            if (effect.conditionValueList.indexOf(recipe.rarity) >= 0) {
                return result;
            }
        }
    } else if (effect.conditionType == "ChefTag") {
        if (chef && chef.chefId) {
            var count = 0;
            for (var i in effect.conditionValueList) {
                if (chef.tags.indexOf(effect.conditionValueList[i]) >= 0) {
                    count++;
                }
            }
            if (count > 0) {
                return result;
            }
        }
    } else if (effect.conditionType == "CookbookTag") {
        if (recipe) {
            var count = 0;
            for (var i in effect.conditionValueList) {
                if (recipe.tags.indexOf(effect.conditionValueList[i]) >= 0) {
                    count++;
                }
            }
            if (count > 0) {
                result.count = count;
                return result;
            }
        }
    } else if (effect.conditionType == "SameSkill") {
        var sameCount = 0;
        var count1 = 0;
        var count2 = 0;
        var count3 = 0;
        var count4 = 0;
        var count5 = 0;
        var count6 = 0;
        for (var i in recipes) {
            var oneRecipe = recipes[i].data;
            if (!oneRecipe) {
                continue;
            }

            if (oneRecipe.stirfry > 0) {
                count1++;
                if (count1 == 3) {
                    sameCount++;
                }
            }
            if (oneRecipe.boil > 0) {
                count2++;
                if (count2 == 3) {
                    sameCount++;
                }
            }
            if (oneRecipe.knife > 0) {
                count3++;
                if (count3 == 3) {
                    sameCount++;
                }
            }
            if (oneRecipe.fry > 0) {
                count4++;
                if (count4 == 3) {
                    sameCount++;
                }
            }
            if (oneRecipe.bake > 0) {
                count5++;
                if (count5 == 3) {
                    sameCount++;
                }
            }
            if (oneRecipe.steam > 0) {
                count6++;
                if (count6 == 3) {
                    sameCount++;
                }
            }
        }
        if (sameCount > 0) {
            result.count = sameCount;
            return result;
        }
    } else if (effect.conditionType == "PerSkill") {
        var count = 0;
        if (customData) {
            for (var i in customData) {
                for (var j in customData[i].recipes) {
                    var oneRecipe = customData[i].recipes[j].data;
                    if (oneRecipe) {
                        if (effect.conditionValue == 1 && oneRecipe.stirfry > 0) {
                            count++;
                        } else if (effect.conditionValue == 2 && oneRecipe.fry > 0) {
                            count++;
                        } else if (effect.conditionValue == 3 && oneRecipe.bake > 0) {
                            count++;
                        } else if (effect.conditionValue == 4 && oneRecipe.steam > 0) {
                            count++;
                        } else if (effect.conditionValue == 5 && oneRecipe.boil > 0) {
                            count++;
                        } else if (effect.conditionValue == 6 && oneRecipe.knife > 0) {
                            count++;
                        }
                    }
                }
            }
        }
        if (count > 0) {
            result.count = count;
            return result;
        }
    } else if (effect.conditionType == "MaterialReduce") {

    } else {
        console.log("unknown conditionType: " + effect.conditionType);
    }

    result.pass = false;
    return result;
}

function getSelfUltimateData(chefs, skills, useUltimate, ids) {
    var result = [];
    if (useUltimate) {
        for (var i in ids) {
            for (var j in chefs) {
                if (ids[i] == chefs[j].chefId) {
                    for (var k in skills) {
                        if (chefs[j].ultimateSkill == skills[k].skillId) {
                            var tempEffect = [];
                            for (var m in skills[k].effect) {
                                if (skills[k].effect[m].condition == "Self") {
                                    tempEffect.push(skills[k].effect[m]);
                                }
                            }
                            if (tempEffect.length) {
                                var selfData = {};
                                selfData["chefId"] = chefs[j].chefId;
                                selfData["effect"] = tempEffect;
                                result.push(selfData);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }
    }
    return result;
}

function getPartialChefAddsByIds(chefs, skills, useUltimate, ids) {
    var partialChefAdds = [];
    if (useUltimate) {
        for (var i in ids) {
            for (var j in chefs) {
                var chef = chefs[j];
                if (ids[i] == chef.chefId) {
                    for (var k in skills) {
                        var skill = skills[k];
                        if (chef.ultimateSkill == skill.skillId) {
                            for (var m in skill.effect) {
                                var effect = skill.effect[m];
                                if (effect.condition == "Partial") {
                                    if (isChefAddType(effect.type)) {
                                        partialChefAdds.push(effect);
                                    }
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }
    }
    return partialChefAdds;
}

function getPartialChefAdds(customData, skills, rule) {
    var round = getCustomRound(rule);
    var partialAdds = [];
    for (var o = 0; o < round; o++) {
        partialAdds.push([]);
    }

    for (var i in customData) {
        var chef = customData[i].chef;
        if (chef.chefId && rule.calPartialChefIds.indexOf(chef.chefId) >= 0) {
            for (var k in skills) {
                var skill = skills[k];
                if (chef.ultimateSkill == skill.skillId) {
                    for (var m in skill.effect) {
                        var effect = JSON.parse(JSON.stringify(skill.effect[m]));
                        if (effect.condition == "Partial") {
                            if (isChefAddType(effect.type)) {
                                var startIndex = 0;
                                if (rule.Satiety) {
                                    startIndex = Number(i);
                                }
                                for (var o = startIndex; o < round; o++) {
                                    partialAdds[o].push(effect);
                                }
                            }
                        } else if (effect.condition == "Next" && Number(i) < round - 1) {
                            if (isChefAddType(effect.type)) {
                                partialAdds[Number(i) + 1].push(effect);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    return partialAdds;
}

function updateMaterialsData(materialsData, recipe, quantity, chef) {
    for (var m in recipe.data.materials) {
        for (var n in materialsData) {
            if (recipe.data.materials[m].material == materialsData[n].materialId) {
                if (Number.isInteger(parseInt(materialsData[n].quantity))) {
                    var mQuantity = calMaterialReduce(chef, recipe.data.materials[m].material, recipe.data.materials[m].quantity);
                    materialsData[n].quantity -= mQuantity * quantity;
                }
            }
        }
    }
}

function getMaxNSum(recipesData, num) {
    recipesData.sort(function (a, b) {
        return b.totalScore - a.totalScore
    });
    var sum = 0;
    var toIndex = Math.min(recipesData.length, num);
    for (var m = 0; m < toIndex; m++) {
        sum += recipesData[m].totalScore;
    }
    return sum;
}

function getMaxNSumRecipes(combsData, data) {
    var allRecipes = [];
    for (var j in combsData) {
        for (var k in combsData[j].recipes) {
            allRecipes.push(combsData[j].recipes[k]);
        }
    }

    allRecipes.sort(function (a, b) {
        return b.totalScore - a.totalScore
    });

    var recipeArray = [];
    var recipeIdArray = [];
    var sum = 0;
    for (var m in allRecipes) {
        if (recipeIdArray.indexOf(allRecipes[m].recipeId) < 0) {
            recipeIdArray.push(allRecipes[m].recipeId);
            recipeArray.push(allRecipes[m]);

            if (recipeIdArray.length <= data.rule.RecipesNumLimit) {
                sum += allRecipes[m].totalScore;
            }

            if (recipeIdArray.length == data.rule.ChefNumLimit * data.rule.RecipesNumLimit) {
                break;
            }
        }
    }
    return { "recipes": recipeArray, "sum": sum };
}