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

    for (j in json.chefs) {
        $('#chk-show-chef').append("<option value='" + j + "'>" + json.chefs[j].name + "</option>");
        $('#food-table thead tr').append("<th>" + json.chefs[j].name + "</th>").append("<th>金币/小时</th>");
    }

    var table = $('#food-table').DataTable({
        data: recipesData,
        "columnDefs": [
            { "searchable": false, "targets": [16, 17] }
        ],
        "language": {
            "search": "查找:",
            "lengthMenu": "一页显示 _MENU_ 条",
            "zeroRecords": "没有找到",
            "info": "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 条记录",
            "infoEmpty": "没有数据",
            "infoFiltered": "(从 _MAX_ 条记录中过滤)"
        },
        "pagingType": "numbers",
        "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "所有"]],
        "pageLength": 20
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

    $('#chk-personal').change(function () {
        if ($(this).prop("checked")) {
            $('#chk-show-get').parent(".btn").removeClass('hidden');
            $('#chk-show-quality').prop("checked", true).parent(".btn").removeClass('hidden');
            $('#chk-show-remark').prop("checked", true).parent(".btn").removeClass('hidden');
            for (j in json.chefs) {
                if (json.chefs[j].show) {
                    $('#chk-show-chef').multiselect('select', j);
                }
            }
            $('#chk-show-chef').parent(".chk-show-chef-wrapper").removeClass('hidden');
            $('#chk-get').prop("checked", true).parents(".box").removeClass('hidden');
            $('#alert-personal').removeClass('hidden');
        }
        else {
            $('#chk-show-get').prop("checked", false).parent(".btn").addClass('hidden');
            $('#chk-show-quality').prop("checked", false).parent(".btn").addClass('hidden');
            $('#chk-show-remark').prop("checked", false).parent(".btn").addClass('hidden');
            $('#chk-show-chef').multiselect('deselectAll', false).parent(".chk-show-chef-wrapper").addClass('hidden');
            $('#chk-get').prop("checked", false).parents(".box").addClass('hidden');
            $('#alert-personal').addClass('hidden');
        }
        initShow(table, json);
    });

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

    $('#food-table').removeClass("hidden");
}

function generateData(json) {
    var recipesData = new Array();
    for (i in json.recipes) {

        if (!json.recipes[i].name) {
            continue;
        }

        if (json.recipes[i].price > 0 && json.recipes[i].time > 0) {

            json.recipes[i].efficiency = json.recipes[i].price * 3600 / json.recipes[i].time;

            if (json.recipes[i].total > 0) {
                json.recipes[i].totalPrice = json.recipes[i].price * json.recipes[i].total;
                json.recipes[i].totalTime = json.recipes[i].time * json.recipes[i].total;
            }
        }

        json.recipes[i].ingredients = "";
        for (k in json.recipes[i].ingredient) {
            json.recipes[i].ingredients += json.ingredients[json.recipes[i].ingredient[k].ingredientId].name + "*" + json.recipes[i].ingredient[k].quantity + " "
        }

        json.recipes[i].guests = "";
        for (m in json.guests) {
            var hasGuest = false;
            for (n in json.guests[m].recipes) {
                if (json.recipes[i].recipeId == json.guests[m].recipes[n].recipeId) {
                    hasGuest = true;
                    break;
                }
            }
            if (hasGuest) {
                json.recipes[i].guests += json.guests[m].name + " - ";
                for (n in json.guests[m].recipes) {
                    var found = false;
                    if (json.guests[m].recipes[n].recipeId > 0) {
                        for (o in json.recipes) {
                            if (json.recipes[o].recipeId == json.guests[m].recipes[n].recipeId) {
                                json.recipes[i].guests += json.recipes[o].name + " ";
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        json.recipes[i].guests += " 暂无 ";
                    }
                }

                json.recipes[i].guests += " - ";

                for (n in json.guests[m].runes) {
                    json.recipes[i].guests += json.runes[json.guests[m].runes[n].runeId].name + " ";
                }

                json.recipes[i].guests += "<br>";
            }
        }

        if (json.recipes[i].unlock == 0) {
            json.recipes[i].unlockname = "有";
        } else if (json.recipes[i].unlock > 0) {
            for (m in json.recipes) {
                if (json.recipes[m].recipeId == json.recipes[i].unlock) {
                    json.recipes[i].unlockname = json.recipes[m].name;
                    break;
                }
            }
        }

        recipesData.push([
            json.recipes[i].recipeId,
            json.recipes[i].name,
            json.recipes[i].fire || "",
            json.recipes[i].stirfry || "",
            json.recipes[i].boil || "",
            json.recipes[i].cut || "",
            json.recipes[i].fry || "",
            json.recipes[i].roast || "",
            json.recipes[i].steam || "",
            json.recipes[i].ingredients || "",
            json.recipes[i].price || "",
            json.recipes[i].time || "",
            json.recipes[i].total || "",
            json.recipes[i].hasOwnProperty('totalPrice') ? json.recipes[i].totalPrice : "",
            json.recipes[i].hasOwnProperty('totalTime') ? json.recipes[i].totalTime : "",
            json.recipes[i].hasOwnProperty('efficiency') ? parseInt(json.recipes[i].efficiency) : "",
            json.recipes[i].origin,
            json.recipes[i].unlockname || "-",
            json.recipes[i].hasOwnProperty('guests') ? json.recipes[i].guests : "",
            json.recipes[i].get,
            json.recipes[i].quality,
            json.recipes[i].remark,
        ]);

        for (j in json.chefs) {

            var times = Number.MAX_VALUE;

            if (json.recipes[i].stirfry > 0) {
                if (json.chefs[j].stirfry > 0) {
                    times = Math.min(times, json.chefs[j].stirfry / json.recipes[i].stirfry);
                } else {
                    times = 0;
                }
            }
            if (times >= 1) {
                if (json.recipes[i].boil > 0) {
                    if (json.chefs[j].boil > 0) {
                        times = Math.min(times, json.chefs[j].boil / json.recipes[i].boil);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].cut > 0) {
                    if (json.chefs[j].cut > 0) {
                        times = Math.min(times, json.chefs[j].cut / json.recipes[i].cut);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].fry > 0) {
                    if (json.chefs[j].fry > 0) {
                        times = Math.min(times, json.chefs[j].fry / json.recipes[i].fry);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].roast > 0) {
                    if (json.chefs[j].roast > 0) {
                        times = Math.min(times, json.chefs[j].roast / json.recipes[i].roast);
                    } else {
                        times = 0;
                    }
                }
            }
            if (times >= 1) {
                if (json.recipes[i].steam > 0) {
                    if (json.chefs[j].steam > 0) {
                        times = Math.min(times, json.chefs[j].steam / json.recipes[i].steam);
                    } else {
                        times = 0;
                    }
                }
            }

            var quality = "-";
            var chefEff = "";

            if (times != Number.MAX_VALUE && times >= 1) {

                var qualityAddition = 0;

                if (times >= 4) {
                    qualityAddition = 0.5;
                    quality = "神";
                } else if (times >= 3) {
                    qualityAddition = 0.3;
                    quality = "特";
                } else if (times >= 2) {
                    qualityAddition = 0.1;
                    quality = "优";
                } else if (times >= 1) {
                    qualityAddition = 0;
                    quality = "可";
                }

                var skillAddition = 0;
                if (json.chefs[j].hasOwnProperty('skill')) {
                    for (k in json.chefs[j].skill) {
                        if (json.chefs[j].skill[k].type == "水产") {
                            var hasSkill = false;
                            for (k in json.recipes[i].ingredient) {
                                if (json.ingredients[json.recipes[i].ingredient[k].ingredientId].originId == 8) {
                                    hasSkill = true;
                                    break;
                                }
                            }
                            if (hasSkill) {
                                skillAddition += json.chefs[j].skill[k].addition;
                            }
                        } else if (json.chefs[j].skill[k].type == "炸类") {
                            var hasSkill = false;
                            for (k in json.recipes[i].ingredient) {
                                if (json.recipes[i].fry > 0) {
                                    hasSkill = true;
                                    break;
                                }
                            }
                            if (hasSkill) {
                                skillAddition += json.chefs[j].skill[k].addition;
                            }
                        }
                    }
                }

                var furnitureAddition = 0;
                if (json.hasOwnProperty('furniture')) {
                    furnitureAddition = json.furniture;
                }

                if (json.recipes[i].hasOwnProperty('efficiency')) {
                    chefEff = (1 + qualityAddition + skillAddition + furnitureAddition) * json.recipes[i].efficiency;
                }
            }

            recipesData[i].push(quality);
            recipesData[i].push(parseInt(chefEff) || "");

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

    for (j in json.chefs) {
        var chkChefs = $('#chk-show-chef').val();
        table.column(22 + 2 * j).visible(chkChefs.indexOf(j) > -1, false);
        table.column(23 + 2 * j).visible(chkChefs.indexOf(j) > -1, false);
    }

    table.columns.adjust().draw(false);
}