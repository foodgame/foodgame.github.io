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
    var recipesData = generateData(json);

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        var chkFire1 = $('#chk-fire-1').prop("checked");
        var chkFire2 = $('#chk-fire-2').prop("checked");
        var chkFire3 = $('#chk-fire-3').prop("checked");
        var chkFire4 = $('#chk-fire-4').prop("checked");
        var chkFire5 = $('#chk-fire-5').prop("checked");
        var fire = parseInt(data[2]) || 0;

        if (chkFire1 && fire == 1
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
        ) {
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
        var check = $('#chk-get').prop("checked");
        var value = data[19];

        if (!check || check && value == "true") {
            return true;
        }
        else {
            return false;
        }
    });

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
            "data": "price",
            "searchable": false
        },
        {
            "data": {
                "_": "time.value",
                "display": "time.display"
            },
            "searchable": false
        },
        {
            "data": "total",
            "searchable": false
        },
        {
            "data": "totalPrice",
            "searchable": false
        },
        {
            "data": {
                "_": "totalTime.value",
                "display": "totalTime.display"
            },
            "searchable": false
        },
        {
            "data": "efficiency",
            "searchable": false
        },
        {
            "data": "origin",
            "searchable": false
        },
        {
            "data": "unlock",
            "searchable": false
        },
        {
            "data": "guests"
        },
        {
            "data": "get"
        },
        {
            "data": "quality",
            "searchable": false
        },
        {
            "data": "remark",
            "searchable": false
        }
    ];

    for (j in json.personal.chefs) {
        $('#chk-show-chef').append("<option value='" + j + "'>" + json.personal.chefs[j].name + "</option>");
        $('#food-table thead tr').append("<th>" + json.personal.chefs[j].name + "</th>").append("<th>效率</th>");

        columns.push({
            "data": "chefQlty" + j,
            "searchable": false
        });
        columns.push({
            "data": "chefEff" + j,
            "searchable": false
        });
    }

    var table = $('#food-table').DataTable({
        data: recipesData,
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
        "dom": "<'row'<'col-sm-4'l><'col-sm-4'i><'col-sm-4'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>"
    });

    $('.chk-skill').click(function () {
        if ($(this).prop("checked")) {
            if ($('#chk-single-skill').prop("checked")) {
                $(".chk-skill").not(this).prop("checked", false);
            }
        }

        table.draw();
    });

    $('.chk-fire input[type="checkbox"]').click(function () {
        table.draw();
    });

    $('#chk-guest').click(function () {
        table.draw();
    });

    $('#chk-get').click(function () {
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

    $('#chk-show-all').click(function () {
        if ($('.btn:not(.hidden) .chk-show:checked').length == $('.btn:not(.hidden) .chk-show').length) {
            $('.btn:not(.hidden) .chk-show').prop("checked", false);
        }
        else {
            $('.btn:not(.hidden) .chk-show').prop("checked", true);
        }
        initShow(table, json);
    });

    if (window.location.search.indexOf("666") > 0) {
        $('#chk-personal').parents(".box").removeClass('hidden');
        $('#chk-personal').bootstrapToggle({
            on: '个人版',
            off: '公共版',
            onstyle: 'default'
        });

        $('#chk-personal').change(function () {
            if ($(this).prop("checked")) {
                $('#chk-show-get').parent(".btn").removeClass('hidden');
                $('#chk-show-quality').prop("checked", true).parent(".btn").removeClass('hidden');
                $('#chk-show-remark').parent(".btn").removeClass('hidden');
                for (j in json.personal.chefs) {
                    if (json.personal.chefs[j].show) {
                        $('#chk-show-chef').multiselect('select', j);
                    }
                }
                $('#chk-show-chef').parent(".chk-show-chef-wrapper").removeClass('hidden');
                $('#chk-get').prop("checked", true).parents(".box").removeClass('hidden');
            }
            else {
                $('#chk-show-get').prop("checked", false).parent(".btn").addClass('hidden');
                $('#chk-show-quality').prop("checked", false).parent(".btn").addClass('hidden');
                $('#chk-show-remark').prop("checked", false).parent(".btn").addClass('hidden');
                $('#chk-show-chef').multiselect('deselectAll', false).parent(".chk-show-chef-wrapper").addClass('hidden');
                $('#chk-get').prop("checked", false).parents(".box").addClass('hidden');
            }
            initShow(table, json);
        });
    }

    initShow(table, json);
    $('.chk-show').click(function () {
        initShow(table, json);
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
        onChange: function (option, checked, select) {
            initShow(table, json);
        }
    });

    $('body').tooltip({ selector: '[data-toggle="tooltip"]' });

    $('#food-table').removeClass("hidden");
}

function generateData(json) {
    var recipesData = new Array();
    for (i in json.recipes) {

        recipesData[i] = new Object();
        recipesData[i]["recipeId"] = json.recipes[i].recipeId;
        recipesData[i]["name"] = json.recipes[i].name;
        recipesData[i]["stirfry"] = json.recipes[i].stirfry || "";
        recipesData[i]["boil"] = json.recipes[i].boil || "";
        recipesData[i]["cut"] = json.recipes[i].cut || "";
        recipesData[i]["fry"] = json.recipes[i].fry || "";
        recipesData[i]["roast"] = json.recipes[i].roast || "";
        recipesData[i]["steam"] = json.recipes[i].steam || "";
        recipesData[i]["price"] = json.recipes[i].price || "";
        recipesData[i]["time"] = {
            "display": json.recipes[i].time != 0 ? secondsToTime(json.recipes[i].time) : "",
            "value": json.recipes[i].time != 0 ? json.recipes[i].time : ""
        };
        recipesData[i]["total"] = json.recipes[i].total || "";
        recipesData[i]["origin"] = json.recipes[i].origin;
        recipesData[i]["unlock"] = json.recipes[i].unlock;
        recipesData[i]["get"] = json.recipes[i].hasOwnProperty('personal') ? true : false;
        recipesData[i]["quality"] = json.recipes[i].hasOwnProperty('personal') ? json.recipes[i].personal.quality : "";
        recipesData[i]["remark"] = json.recipes[i].hasOwnProperty('personal') ? json.recipes[i].personal.remark : "";

        var fireDisp = "";
        for (j = 0; j < json.recipes[i].fire; j++) {
            fireDisp += "&#x2605;";
        }
        recipesData[i]["fire"] = {
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

        recipesData[i]["totalPrice"] = totalPrice ? totalPrice : "";
        recipesData[i]["totalTime"] = {
            "display": totalTime ? secondsToTime(totalTime) : "",
            "value": totalTime ? totalTime : ""
        };
        recipesData[i]["efficiency"] = efficiency ? parseInt(efficiency) : "";

        var ingredientsDisp = "";
        var ingredientsVal = "";
        for (k in json.recipes[i].ingredient) {
            ingredientsDisp += json.recipes[i].ingredient[k].name + "*" + json.recipes[i].ingredient[k].quantity + " "
            ingredientsVal += json.recipes[i].ingredient[k].name;
        }
        recipesData[i]["ingredients"] = {
            "display": ingredientsDisp,
            "value": ingredientsVal
        };

        var guests = "";
        var guests = "";
        for (m in json.guests) {
            var hasGuest = false;
            for (n in json.guests[m].gifts) {
                if (json.recipes[i].name == json.guests[m].gifts[n].recipe) {
                    guests += json.guests[m].name + "-" + json.guests[m].gifts[n].rune + "<br>";
                    break;
                }
            }
        }
        recipesData[i]["guests"] = guests;

        for (j in json.personal.chefs) {

            var times = Number.MAX_VALUE;

            if (json.recipes[i].stirfry > 0) {
                if (json.personal.chefs[j].stirfry > 0) {
                    times = Math.min(times, json.personal.chefs[j].stirfry / json.recipes[i].stirfry);
                } else {
                    times = 0;
                }
            }
            if (times >= 1) {
                if (json.recipes[i].boil > 0) {
                    if (json.personal.chefs[j].boil > 0) {
                        times = Math.min(times, json.personal.chefs[j].boil / json.recipes[i].boil);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].cut > 0) {
                    if (json.personal.chefs[j].cut > 0) {
                        times = Math.min(times, json.personal.chefs[j].cut / json.recipes[i].cut);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].fry > 0) {
                    if (json.personal.chefs[j].fry > 0) {
                        times = Math.min(times, json.personal.chefs[j].fry / json.recipes[i].fry);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].roast > 0) {
                    if (json.personal.chefs[j].roast > 0) {
                        times = Math.min(times, json.personal.chefs[j].roast / json.recipes[i].roast);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].steam > 0) {
                    if (json.personal.chefs[j].steam > 0) {
                        times = Math.min(times, json.personal.chefs[j].steam / json.recipes[i].steam);
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
                if (json.personal.chefs[j].hasOwnProperty('skill')) {
                    for (k in json.personal.chefs[j].skill) {
                        if (json.personal.chefs[j].skill[k].type == "水产") {
                            var hasSkill = false;
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
                            if (hasSkill) {
                                skillAddition += json.personal.chefs[j].skill[k].addition;
                            }
                        } else if (json.personal.chefs[j].skill[k].type == "炸类") {
                            var hasSkill = false;
                            for (k in json.recipes[i].ingredient) {
                                if (json.recipes[i].fry > 0) {
                                    hasSkill = true;
                                    break;
                                }
                            }
                            if (hasSkill) {
                                skillAddition += json.personal.chefs[j].skill[k].addition;
                            }
                        }
                    }
                }

                if (efficiency > 0) {
                    chefEff = (1 + qualityAddition + skillAddition + json.personal.furniture) * efficiency;
                }
            }

            recipesData[i]["chefQlty" + j] = chefQlty;
            recipesData[i]["chefEff" + j] = chefEff ? parseInt(chefEff) : "";

        }
    }

    return recipesData;
}

function initShow(table, json) {
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
    table.column(19).visible($('#chk-show-get').prop("checked"), false);
    table.column(20).visible($('#chk-show-quality').prop("checked"), false);
    table.column(21).visible($('#chk-show-remark').prop("checked"), false);

    for (j in json.personal.chefs) {
        var chkChefs = $('#chk-show-chef').val();
        table.column(22 + 2 * j).visible(chkChefs.indexOf(j) > -1, false);
        table.column(23 + 2 * j).visible(chkChefs.indexOf(j) > -1, false);
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