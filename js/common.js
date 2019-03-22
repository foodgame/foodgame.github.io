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
        if (times >= 4) {
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

function getRecipeSkillAddition(effects, recipe, rule) {
    var addition = 0;
    for (var k in effects) {
        var type = effects[k].type;
        var hasSkill = false;
        if (type == "UseFish") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "池塘") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseCreation") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "作坊") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseMeat") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "牧场"
                    || recipe.materials[m].origin == "鸡舍"
                    || recipe.materials[m].origin == "猪圈") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseVegetable") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "菜棚"
                    || recipe.materials[m].origin == "菜地"
                    || recipe.materials[m].origin == "森林") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseStirfry") {
            if (recipe.stirfry > 0) {
                hasSkill = true;
            }
        } else if (type == "UseBoil") {
            if (recipe.boil > 0) {
                hasSkill = true;
            }
        } else if (type == "UseFry") {
            if (recipe.fry > 0) {
                hasSkill = true;
            }
        } else if (type == "UseKnife") {
            if (recipe.knife > 0) {
                hasSkill = true;
            }
        } else if (type == "UseBake") {
            if (recipe.bake > 0) {
                hasSkill = true;
            }
        } else if (type == "UseSteam") {
            if (recipe.steam > 0) {
                hasSkill = true;
            }
        } else if (type == "Gold_Gain") {
            if (!rule || rule.Id == 0) {
                hasSkill = true;
            }
        }

        if (hasSkill) {
            addition += effects[k].value;
        }
    }
    return +addition.toFixed(2);
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

function getPercentDisp(percent) {
    if (percent != 0) {
        return percent.toString() + "%";
    } else {
        return "";
    }
}

function getRecipeQuantity(recipe, materials, rule) {
    var quantity = 1;
    if (!rule.hasOwnProperty("DisableMultiCookbook") || rule.DisableMultiCookbook == false) {
        quantity = recipe.limitVal;
    }

    for (var m in recipe.materials) {
        var exist = false;
        for (var n in materials) {
            if (recipe.materials[m].material == materials[n].materialId) {
                exist = true;
                if (materials[n].quantity) {
                    var tt = Math.floor(materials[n].quantity / recipe.materials[m].quantity);
                    if (tt < quantity) {
                        quantity = tt;
                    }
                    break;
                } else if (materials[n].quantity === 0) {
                    return 0;
                }
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

function getRecipeResult(chef, equip, recipe, quantity, maxQuantity, materials, rule, decoration) {

    var resultData = {};

    var rankAddition = 0;
    var chefSkillAddition = 0;
    var equipSkillAddition = 0;
    var decorationAddition = 0;
    var bonusAddition = 0;

    resultData["disp"] = recipe.name;

    if (chef) {
        var rankData = getRankInfo(recipe, chef);
        resultData["rankVal"] = rankData.rankVal;
        resultData["rankDisp"] = rankData.rankDisp;

        if (rankData.rankVal == 0) {
            return resultData;
        }

        if (!rule || !rule.hasOwnProperty("DisableCookbookRank") || rule.DisableCookbookRank == false) {
            rankAddition = rankData.rankAddition;
        }

        resultData["rankAdditionDisp"] = getPercentDisp(rankAddition);

        if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
            chefSkillAddition = getRecipeSkillAddition(chef.specialSkillEffect, recipe, rule);
        }
        resultData["chefSkillAdditionDisp"] = getPercentDisp(chefSkillAddition);

        if (!rule || !rule.hasOwnProperty("DisableEquipSkillEffect") || rule.DisableEquipSkillEffect == false) {
            if (equip) {
                equipSkillAddition = getRecipeSkillAddition(equip.effect, recipe, rule);
            }
        }
        resultData["equipSkillAdditionDisp"] = getPercentDisp(equipSkillAddition);

        bonusAddition = bonusAddition + Number(chef.addition);
    }

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

    var priceAddition = (rankAddition + chefSkillAddition + equipSkillAddition + decorationAddition + recipe.ultimateAddition) / 100;

    resultData["data"] = recipe;
    resultData["quantity"] = quantity;
    resultData["max"] = maxQuantity;
    resultData["limit"] = quantity;
    resultData["bonusAdditionDisp"] = getPercentDisp(+(bonusAddition * 100).toFixed(2));
    resultData["totalPrice"] = recipe.price * quantity;
    resultData["realPrice"] = Math.ceil(+(recipe.price * (1 + priceAddition)).toFixed(2));
    resultData["totalRealPrice"] = resultData.realPrice * quantity;
    var score = Math.ceil(+(recipe.price * (1 + priceAddition + bonusAddition)).toFixed(2));
    resultData["bonusScore"] = score - resultData.realPrice;
    resultData["totalBonusScore"] = resultData.bonusScore * quantity;
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

function setAddition(addition, effect) {
    if (effect.cal == "Abs") {
        addition.abs = +(addition.abs + effect.value).toFixed(2);
    } else if (effect.cal == "Percent") {
        addition.percent = +(addition.percent + effect.value).toFixed(2);
    }
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

function getEquipInfo(equipName, equips) {
    var info = null;
    if (equipName) {
        for (var j in equips) {
            if (equipName == equips[j].name) {
                info = {};
                info["name"] = equips[j].name;
                info["effect"] = equips[j].effect;
                info["disp"] = equips[j].name + "<br><small>" + equips[j].skillDisp + "</small>";
                break;
            }
        }
    }
    return info;
}

function setDataForChef(chef, equip, useEquip, globalUltimateEffect, selfPartialUltimateData, otherPartialUltimateData) {

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

    var effects = globalUltimateEffect;

    if (useEquip && equip && equip.effect) {
        effects = effects.concat(equip.effect);
    }

    var selfPartialAdded = false;
    if (selfPartialUltimateData) {
        for (var i in selfPartialUltimateData) {
            if (chef.chefId == selfPartialUltimateData[i].chefId) {
                effects = effects.concat(selfPartialUltimateData[i].effect);
                selfPartialAdded = true;
                break;
            }
        }
    }

    if (otherPartialUltimateData) {
        for (var i in otherPartialUltimateData) {
            if (chef.chefId == otherPartialUltimateData[i].chefId && selfPartialAdded) {
                continue;
            }
            effects = effects.concat(otherPartialUltimateData[i].effect);
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
        }
    }

    chef["meatVal"] = chef.meat + meatAddition;
    chef["creationVal"] = chef.creation + creationAddition;
    chef["vegVal"] = chef.veg + vegAddition;
    chef["fishVal"] = chef.fish + fishAddition;

    chef["meatDisp"] = getChefAtrributeDisp(chef.meatVal, chef.meat);
    chef["creationDisp"] = getChefAtrributeDisp(chef.creationVal, chef.creation);
    chef["vegDisp"] = getChefAtrributeDisp(chef.vegVal, chef.veg);
    chef["fishDisp"] = getChefAtrributeDisp(chef.fishVal, chef.fish);

    chef["stirfryVal"] = Math.ceil(calAddition(chef.stirfry, stirfryAddition));
    chef["boilVal"] = Math.ceil(calAddition(chef.boil, boilAddition));
    chef["knifeVal"] = Math.ceil(calAddition(chef.knife, knifeAddition));
    chef["fryVal"] = Math.ceil(calAddition(chef.fry, fryAddition));
    chef["bakeVal"] = Math.ceil(calAddition(chef.bake, bakeAddition));
    chef["steamVal"] = Math.ceil(calAddition(chef.steam, steamAddition));

    chef["stirfryDisp"] = getChefAtrributeDisp(chef.stirfryVal, chef.stirfry);
    chef["boilDisp"] = getChefAtrributeDisp(chef.boilVal, chef.boil);
    chef["knifeDisp"] = getChefAtrributeDisp(chef.knifeVal, chef.knife);
    chef["fryDisp"] = getChefAtrributeDisp(chef.fryVal, chef.fry);
    chef["bakeDisp"] = getChefAtrributeDisp(chef.bakeVal, chef.bake);
    chef["steamDisp"] = getChefAtrributeDisp(chef.steamVal, chef.steam);

    chef["disp"] = chef.name + "<br><small>";
    var count = 0;
    if (chef.stirfryDisp) {
        chef.disp += "炒" + chef.stirfryDisp + " ";
        count++;
    }
    if (chef.boilDisp) {
        chef.disp += "煮" + chef.boilDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.knifeDisp) {
        chef.disp += "切" + chef.knifeDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.fryDisp) {
        chef.disp += "炸" + chef.fryDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.bakeDisp) {
        chef.disp += "烤" + chef.bakeDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.steamDisp) {
        chef.disp += "蒸" + chef.steamDisp + " ";
    }
    chef.disp += "</small>"
}

function getChefAtrributeDisp(final, origin) {
    var disp = "";
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

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getPartialUltimateData(chefs, skills, useUltimate, ids) {
    var result = [];
    if (useUltimate) {
        for (var i in ids) {
            for (var j in chefs) {
                if (ids[i] == chefs[j].chefId) {
                    for (var k in skills) {
                        if (chefs[j].ultimateSkill == skills[k].skillId) {
                            var tempEffect = [];
                            for (var m in skills[k].effect) {
                                if (skills[k].effect[m].condition == "Partial") {
                                    tempEffect.push(skills[k].effect[m]);
                                }
                            }
                            if (tempEffect.length) {
                                var partialData = {};
                                partialData["chefId"] = chefs[j].chefId;
                                partialData["effect"] = tempEffect;
                                result.push(partialData);
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