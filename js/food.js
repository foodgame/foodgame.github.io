$(function () {
    $.ajax({
        cache: false,
        success: function (data) {
            init(data);
        },
        url: 'data/data.json'
    });
});

function init(json) {
    var private = window.location.search.indexOf("666") > 0;
    var data = generateData(json, private);

    var columns = [
        {
            "data": "recipeId"
        },
        {
            "data": "name"
        },
        {
            "data": {
                "_": "fire.value",
                "display": "fire.display"
            },
        },
        {
            "data": "stirfry"
        },
        {
            "data": "boil"
        },
        {
            "data": "cut"
        },
        {
            "data": "fry"
        },
        {
            "data": "roast"
        },
        {
            "data": "steam"
        },
        {
            "data": {
                "_": "ingredients.value",
                "display": "ingredients.display"
            }
        },
        {
            "data": "price"
        },
        {
            "data": {
                "_": "time.value",
                "display": "time.display"
            }
        },
        {
            "data": "total"
        },
        {
            "data": "totalPrice"
        },
        {
            "data": {
                "_": "totalTime.value",
                "display": "totalTime.display"
            }
        },
        {
            "data": "efficiency"
        },
        {
            "data": "origin"
        },
        {
            "data": "unlock"
        },
        {
            "data": "guests"
        },
        {
            "data": {
                "_": "levelGuests.value",
                "display": "levelGuests.display"
            }
        },
        {
            "data": "godRune"
        },
        {
            "data": "get"
        },
        {
            "data": "quality"
        },
        {
            "data": "remark"
        }
    ];

    for (j in data.chefs) {
        $('#chk-show-chef').append("<option value='" + j + "'>" + data.chefs[j].name + "</option>");
        $('#food-table thead tr').append("<th>" + data.chefs[j].name + "</th>").append("<th>效率</th>");

        columns.push({
            "data": "chefs." + j + ".chefQlty",
            "searchable": false
        });
        columns.push({
            "data": "chefs." + j + ".chefEff",
            "searchable": false
        });
    }

    var table = $('#food-table').DataTable({
        data: data.recipes,
        "columns": columns,
        "language": {
            "search": "查找:",
            "lengthMenu": "一页显示 _MENU_ 个",
            "zeroRecords": "没有找到",
            "info": "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 个菜谱",
            "infoEmpty": "没有数据",
            "infoFiltered": "(从 _MAX_ 个菜谱中过滤)"
        },
        "pagingType": "numbers",
        "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "所有"]],
        "pageLength": 20,
        "dom": "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>"
    });

    $("div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="菜名 材料 符文 ..."></label>');

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        var chkFire0 = $('#chk-fire-0').prop("checked");
        var chkFire1 = $('#chk-fire-1').prop("checked");
        var chkFire2 = $('#chk-fire-2').prop("checked");
        var chkFire3 = $('#chk-fire-3').prop("checked");
        var chkFire4 = $('#chk-fire-4').prop("checked");
        var chkFire5 = $('#chk-fire-5').prop("checked");
        var fire = parseInt(data[2]) || 0;

        if (chkFire0 && fire == 0
            || chkFire1 && fire == 1
            || chkFire2 && fire == 2
            || chkFire3 && fire == 3
            || chkFire4 && fire == 4
            || chkFire5 && fire == 5) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if ($('#chk-skill-stirfry').prop("checked") && (parseInt(data[3]) || 0) > 0
            || $('#chk-skill-boil').prop("checked") && (parseInt(data[4]) || 0) > 0
            || $('#chk-skill-cut').prop("checked") && (parseInt(data[5]) || 0) > 0
            || $('#chk-skill-fry').prop("checked") && (parseInt(data[6]) || 0) > 0
            || $('#chk-skill-roast').prop("checked") && (parseInt(data[7]) || 0) > 0
            || $('#chk-skill-steam').prop("checked") && (parseInt(data[8]) || 0) > 0
            || ($('#chk-skill-unknown').prop("checked") && (parseInt(data[3]) || 0) == 0 && (parseInt(data[4]) || 0) == 0 && (parseInt(data[5]) || 0) == 0
                && (parseInt(data[6]) || 0) == 0 && (parseInt(data[7]) || 0) == 0 && (parseInt(data[8]) || 0) == 0)
        ) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        var min = parseInt($('#input-price').val());
        var price = parseFloat(data[10]) || 0;

        if (isNaN(min) || min < price) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        var check = $('#chk-guest').prop("checked");
        var value = data[18];

        if (!check || check && value) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        var value = $(".search-box input").val().toLowerCase();
        var searchCols = [0, 1, 9, 18];

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].toLowerCase().indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $('#chk-show-all').click(function () {
        if ($('.btn:not(.hidden) .chk-show:checked').length == $('.btn:not(.hidden) .chk-show').length) {
            $('.btn:not(.hidden) .chk-show').prop("checked", false);
        }
        else {
            $('.btn:not(.hidden) .chk-show').prop("checked", true);
        }
        initShow(table, data, private);
    });

    $('#chk-show-chef').multiselect({
        enableFiltering: true,
        filterPlaceholder: '查找',
        includeSelectAllOption: true,
        numberDisplayed: 1,
        selectAllText: '选择所有',
        allSelectedText: '厨师',
        nonSelectedText: '厨师',
        nSelectedText: '厨师',
        maxHeight: 200,
        onChange: function (option, checked, select) {
            initShow(table, data, private);
        }
    });

    $('.chk-fire input[type="checkbox"]').click(function () {
        table.draw();
    });

    $('.chk-skill').click(function () {
        if ($(this).prop("checked")) {
            if ($('#chk-single-skill').prop("checked")) {
                $(".chk-skill").not(this).prop("checked", false);
            }
        }

        table.draw();
    });

    $('#chk-single-skill').change(function () {
        if ($(this).prop("checked")) {
            if ($('.chk-skill:checked').length > 1) {
                $('.chk-skill').prop("checked", false);
                table.draw();
            }
        }
    });

    $('#chk-skill-all').click(function () {
        if ($('#chk-single-skill').prop("checked")) {
            $('#chk-single-skill').bootstrapToggle('off')
        }
        $(".chk-skill").prop("checked", true);
        table.draw();
    });

    $('#input-price').keyup(function () {
        table.draw();
    });

    $('#chk-guest').click(function () {
        table.draw();
    });

    $('.search-box input').keyup(function () {
        table.draw();
    });

    if (private) {
        for (j in data.chefs) {
            if (data.chefs[j].show) {
                $('#chk-show-chef').multiselect('select', j);
            }
        }

        $('#chk-show-origin').prop("checked", false)
        $('#chk-show-level-guest').parent(".btn").removeClass('hidden');
        $('#chk-show-god-rune').parent(".btn").removeClass('hidden');
        $('#chk-show-get').parent(".btn").removeClass('hidden');
        $('#chk-show-quality').prop("checked", true).parent(".btn").removeClass('hidden');
        $('#chk-show-remark').prop("checked", true).parent(".btn").removeClass('hidden');

        $('#input-guest-rune').parents(".box").removeClass('hidden');
        $('#input-guest-rune').keyup(function () {
            table.draw();
        });
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            var value = $("#input-guest-rune").val();
            var searchCols = [19, 20];

            for (var i = 0, len = searchCols.length; i < len; i++) {
                if (data[searchCols[i]].indexOf(value) !== -1) {
                    return true;
                }
            }

            return false;
        });

        $('#chk-get').prop("checked", true).parents(".box").removeClass('hidden');
        $('#chk-get').click(function () {
            table.draw();
        });
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            var check = $('#chk-get').prop("checked");
            var value = data[21];

            if (!check || check && value == "true") {
                return true;
            }
            else {
                return false;
            }
        });

        new $.fn.dataTable.FixedHeader(table, {});
    }

    initShow(table, data, private);
    $('.chk-show').click(function () {
        initShow(table, data, private);
    });

    $('body').removeClass("hidden");
    table.draw();
}

function generateData(json, private) {
    var retData = new Object();
    retData["chefs"] = new Array();

    for (j in json.personal.chefs) {
        retData["chefs"].push(json.personal.chefs[j]);
    }

    var recipesData = new Array();
    var dataCount = 0;
    for (i in json.recipes) {

        if (!json.recipes[i].name) {
            continue;
        }

        recipesData[dataCount] = new Object();
        recipesData[dataCount]["recipeId"] = json.recipes[i].recipeId;
        recipesData[dataCount]["name"] = json.recipes[i].name;
        recipesData[dataCount]["stirfry"] = json.recipes[i].stirfry || "";
        recipesData[dataCount]["boil"] = json.recipes[i].boil || "";
        recipesData[dataCount]["cut"] = json.recipes[i].cut || "";
        recipesData[dataCount]["fry"] = json.recipes[i].fry || "";
        recipesData[dataCount]["roast"] = json.recipes[i].roast || "";
        recipesData[dataCount]["steam"] = json.recipes[i].steam || "";
        recipesData[dataCount]["price"] = json.recipes[i].price || "";
        recipesData[dataCount]["time"] = {
            "display": json.recipes[i].time != 0 ? secondsToTime(json.recipes[i].time) : "",
            "value": json.recipes[i].time != 0 ? json.recipes[i].time : ""
        };
        recipesData[dataCount]["total"] = json.recipes[i].total || "";
        recipesData[dataCount]["origin"] = json.recipes[i].origin;
        recipesData[dataCount]["unlock"] = json.recipes[i].unlock;
        recipesData[dataCount]["godRune"] = json.recipes[i].godRune;
        recipesData[dataCount]["get"] = json.recipes[i].hasOwnProperty('personal') ? true : false;
        recipesData[dataCount]["quality"] = json.recipes[i].hasOwnProperty('personal') ? json.recipes[i].personal.quality : "";
        recipesData[dataCount]["remark"] = json.recipes[i].hasOwnProperty('personal') ? json.recipes[i].personal.remark : "";

        var fireDisp = "";
        for (j = 0; j < json.recipes[i].fire; j++) {
            fireDisp += "&#x2605;";
        }
        recipesData[dataCount]["fire"] = {
            "display": fireDisp,
            "value": json.recipes[i].fire
        };

        var totalPrice = 0;
        var totalTime = 0;
        var efficiency = 0;

        if (json.recipes[i].price > 0 && json.recipes[i].time > 0) {

            efficiency = json.recipes[i].price * 3600 / json.recipes[i].time;

            if (json.recipes[i].total > 0) {
                totalPrice = json.recipes[i].price * json.recipes[i].total;
                totalTime = json.recipes[i].time * json.recipes[i].total;
            }
        }

        recipesData[dataCount]["totalPrice"] = totalPrice ? totalPrice : "";
        recipesData[dataCount]["totalTime"] = {
            "display": totalTime ? secondsToTime(totalTime) : "",
            "value": totalTime ? totalTime : ""
        };
        recipesData[dataCount]["efficiency"] = efficiency ? parseInt(efficiency) : "";

        var ingredientsDisp = "";
        var ingredientsVal = "";
        for (k in json.recipes[i].ingredient) {
            ingredientsDisp += json.recipes[i].ingredient[k].name + "*" + json.recipes[i].ingredient[k].quantity + " "
            ingredientsVal += json.recipes[i].ingredient[k].name;
        }
        recipesData[dataCount]["ingredients"] = {
            "display": ingredientsDisp,
            "value": ingredientsVal
        };

        var levelGuestsDisp = "";
        var levelGuestsVal = "";
        for (g in json.recipes[i].guests) {
            if (json.recipes[i].guests[g].guest) {
                levelGuestsDisp += json.recipes[i].guests[g].quality + "-" + json.recipes[i].guests[g].guest + "<br>";
                levelGuestsVal += json.recipes[i].guests[g].guest;
            }
        }
        recipesData[dataCount]["levelGuests"] = {
            "display": levelGuestsDisp,
            "value": levelGuestsVal
        };

        var guests = "";
        for (m in json.guests) {
            for (n in json.guests[m].gifts) {
                if (json.recipes[i].name == json.guests[m].gifts[n].recipe) {
                    guests += json.guests[m].name + "-" + json.guests[m].gifts[n].rune + "<br>";
                    break;
                }
            }
        }
        recipesData[dataCount]["guests"] = guests;

        recipesData[dataCount]["chefs"] = new Array();
        for (j in retData["chefs"]) {

            var times = Number.MAX_VALUE;

            if (json.recipes[i].stirfry > 0) {
                if (retData["chefs"][j].stirfry > 0) {
                    times = Math.min(times, retData["chefs"][j].stirfry / json.recipes[i].stirfry);
                } else {
                    times = 0;
                }
            }
            if (times >= 1) {
                if (json.recipes[i].boil > 0) {
                    if (retData["chefs"][j].boil > 0) {
                        times = Math.min(times, retData["chefs"][j].boil / json.recipes[i].boil);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].cut > 0) {
                    if (retData["chefs"][j].cut > 0) {
                        times = Math.min(times, retData["chefs"][j].cut / json.recipes[i].cut);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].fry > 0) {
                    if (retData["chefs"][j].fry > 0) {
                        times = Math.min(times, retData["chefs"][j].fry / json.recipes[i].fry);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].roast > 0) {
                    if (retData["chefs"][j].roast > 0) {
                        times = Math.min(times, retData["chefs"][j].roast / json.recipes[i].roast);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].steam > 0) {
                    if (retData["chefs"][j].steam > 0) {
                        times = Math.min(times, retData["chefs"][j].steam / json.recipes[i].steam);
                    } else {
                        times = 0;
                    }
                }
            }

            var chefQlty = "-";
            var chefEff = 0;

            if (times != Number.MAX_VALUE && times >= 1) {

                var qualityAddition = 0;

                if (times >= 4) {
                    qualityAddition = 0.5;
                    chefQlty = "神";
                } else if (times >= 3) {
                    qualityAddition = 0.3;
                    chefQlty = "特";
                } else if (times >= 2) {
                    qualityAddition = 0.1;
                    chefQlty = "优";
                } else if (times >= 1) {
                    qualityAddition = 0;
                    chefQlty = "可";
                }

                var skillAddition = 0;
                if (retData["chefs"][j].hasOwnProperty('skill')) {
                    for (k in retData["chefs"][j].skill) {
                        var hasSkill = false;
                        if (retData["chefs"][j].skill[k].type.indexOf("水产") >= 0) {
                            for (m in json.recipes[i].ingredient) {
                                for (n in json.ingredients) {
                                    if (json.recipes[i].ingredient[m].name == json.ingredients[n].name) {
                                        if (json.ingredients[n].originId == 8) {
                                            hasSkill = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("面") >= 0) {
                            for (m in json.recipes[i].ingredient) {
                                for (n in json.ingredients) {
                                    if (json.recipes[i].ingredient[m].name == json.ingredients[n].name) {
                                        if (json.ingredients[n].originId == 1) {
                                            hasSkill = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("肉") >= 0) {
                            for (m in json.recipes[i].ingredient) {
                                for (n in json.ingredients) {
                                    if (json.recipes[i].ingredient[m].name == json.ingredients[n].name) {
                                        if (json.ingredients[n].originId == 2
                                            || json.ingredients[n].originId == 3
                                            || json.ingredients[n].originId == 4) {
                                            hasSkill = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("蔬菜") >= 0) {
                            for (m in json.recipes[i].ingredient) {
                                for (n in json.ingredients) {
                                    if (json.recipes[i].ingredient[m].name == json.ingredients[n].name) {
                                        if (json.ingredients[n].originId == 5
                                            || json.ingredients[n].originId == 6
                                            || json.ingredients[n].originId == 7) {
                                            hasSkill = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("炒") >= 0) {
                            if (json.recipes[i].stirfry > 0) {
                                hasSkill = true;
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("煮") >= 0) {
                            if (json.recipes[i].boil > 0) {
                                hasSkill = true;
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("炸") >= 0) {
                            if (json.recipes[i].fry > 0) {
                                hasSkill = true;
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("切") >= 0) {
                            if (json.recipes[i].cut > 0) {
                                hasSkill = true;
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("烤") >= 0) {
                            if (json.recipes[i].roast > 0) {
                                hasSkill = true;
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("蒸") >= 0) {
                            if (json.recipes[i].steam > 0) {
                                hasSkill = true;
                            }
                        }
                        if (retData["chefs"][j].skill[k].type.indexOf("金币") >= 0) {
                            hasSkill = true;
                        }

                        if (hasSkill) {
                            skillAddition += retData["chefs"][j].skill[k].addition;
                        }
                    }
                }

                if (efficiency > 0) {
                    chefEff = (1 + qualityAddition + skillAddition + (private ? json.personal.furniture : 0)) * efficiency;
                }
            }

            recipesData[dataCount]["chefs"].push({
                "chefQlty": chefQlty,
                "chefEff": chefEff ? parseInt(chefEff) : ""
            });
        }

        dataCount++;
    }

    retData["recipes"] = recipesData;

    return retData;
}

function initShow(table, data, private) {
    table.column(0).visible($('#chk-show-id').prop("checked"), false);
    table.column(2).visible($('#chk-show-fire').prop("checked"), false);

    var chkSkill = $('#chk-show-skill').prop("checked");
    table.column(3).visible(chkSkill, false);
    table.column(4).visible(chkSkill, false);
    table.column(5).visible(chkSkill, false);
    table.column(6).visible(chkSkill, false);
    table.column(7).visible(chkSkill, false);
    table.column(8).visible(chkSkill, false);
    table.column(9).visible($('#chk-show-ingredient').prop("checked"), false);
    table.column(10).visible($('#chk-show-price').prop("checked"), false);
    table.column(11).visible($('#chk-show-time').prop("checked"), false);
    table.column(12).visible($('#chk-show-total').prop("checked"), false);
    table.column(13).visible($('#chk-show-total-price').prop("checked"), false);
    table.column(14).visible($('#chk-show-total-time').prop("checked"), false);
    table.column(15).visible($('#chk-show-efficiency').prop("checked"), false);
    table.column(16).visible($('#chk-show-origin').prop("checked"), false);
    table.column(17).visible($('#chk-show-unlock').prop("checked"), false);
    table.column(18).visible($('#chk-show-guest').prop("checked"), false);

    if (private) {
        table.column(19).visible($('#chk-show-level-guest').prop("checked"), false);
        table.column(20).visible($('#chk-show-god-rune').prop("checked"), false);
        table.column(21).visible($('#chk-show-get').prop("checked"), false);
        table.column(22).visible($('#chk-show-quality').prop("checked"), false);
        table.column(23).visible($('#chk-show-remark').prop("checked"), false);
    } else {
        table.column(19).visible(false, false);
        table.column(20).visible(false, false);
        table.column(21).visible(false, false);
        table.column(22).visible(false, false);
        table.column(23).visible(false, false);
    }

    for (j in data.chefs) {
        var chkChefs = $('#chk-show-chef').val();
        table.column(24 + 2 * j).visible(chkChefs.indexOf(j) > -1, false);
        table.column(25 + 2 * j).visible(chkChefs.indexOf(j) > -1, false);
    }

    table.columns.adjust().draw(false);
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