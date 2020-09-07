$(function () {
    if (window.location.href.indexOf("github") > 0) {
        $('.loading-text').append("<h3>您访问的是github网站，如您是国内用户，建议使用gitee网站<a href='https://foodgame.gitee.io'>https://foodgame.gitee.io</a></h3>");
    }
});

function commaSeparatedMatch(data, value) {
    if (value.length === 0) return true;
    var values = value.split(/[,\s]/);
    for (var i = 0; i < values.length; i++) {
        if (values[i].length === 0) continue;
        if (data.indexOf(values[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function init(json) {

    initFunction();

    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (private) {
        $.ajax({
            cache: false,
            success: function (json2) {
                $.ajax({
                    cache: false,
                    success: function (json3) {
                        json2 = $.extend(json2, json3);
                        var data = generateData(json, json2, person);
                        initTables(data, person);
                    },
                    error: function () {
                        var data = generateData(json, json2, person);
                        initTables(data, person);
                    },
                    url: 'others/data/data3.json'
                });
            },
            error: function () {
                var data = generateData(json, null, person);
                initTables(data, person);
            },
            url: 'others/data/data2.json'
        });
    } else {
        var data = generateData(json, null, person);
        initTables(data, person);
    }
}

var private = false, currentRule;
function initFunction() {
    var a = getParameterByName('a');
    if (a && lcode(a) == "cb8f8a72f7e4924a75cb75a4a59c0b8d61e70c0cb84f84edf7ede4c8") {
        private = true;
        $('head').append('<link rel="stylesheet" type="text/css" href="others/css/image.css">');
        $('#chk-recipe-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-chef-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-equip-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-decoration-no-origin').closest(".btn").removeClass('hidden');
        $("#chk-cal-no-origin").closest(".btn").removeClass('hidden');
        $("#chk-cal-no-origin").prop("checked", true);
    }
}

function initTables(data, person) {

    updateMenu(person);

    setPartialUltimateOptions(data.chefs, data.partialSkill);

    initRecipeTable(data);

    initChefTable(data);

    initEquipTable(data);

    initDecorationTable(data);

    initMaterialTable(data);

    initQuestTable(data);

    initImportExport(data);

    initCalTables(data);

    $.fn.dataTable.ext.order['dom-selected'] = function (settings, col) {
        return this.api().column(col, { order: 'index' }).nodes().map(function (td, i) {
            return $(td).parent("tr").hasClass("selected") ? '1' : '0';
        });
    }

    initInfo(data);

    initVersionTip(person);

    initTooltip();

    initSetting(data);

    updateSetting(person);

    $('.main-nav a[data-id="1"], .main-nav a[data-id="2"]').on('show.bs.tab', function (e) {
        if ($(e.target).attr("data-id") == "1") {
            $("#select-partial-ultimate").appendTo("#select-partial-ultimate-recipe");
        } else {
            $("#select-partial-ultimate").appendTo("#select-partial-ultimate-chef");
        }
    });

    $('.main-nav a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if ($(this).attr("data-init") != "true") {
            $('.dataTables_scrollBody:visible table.dataTable').DataTable().draw(false);
            updateScrollHeight();
        }
    });

    $('.dataTables_scrollBody table.dataTable').on('page.dt', function () {
        $(this).closest('.dataTables_scrollBody').scrollTop(0);
    });

    $('.bootstrap-select').hover(
        function () {
            $('.bootstrap-select').removeClass("hover-item");
            var element = $(this);
            element.addClass("hover-item");
            setTimeout(function () {
                if (!element.hasClass("open") && element.hasClass("hover-item")) {
                    element.find("select").selectpicker('toggle');
                }
            }, 10);
        }, function () {
            var element = $(this);
            element.removeClass("hover-item");
            setTimeout(function () {
                if (element.hasClass("open")) {
                    element.find("select").selectpicker('toggle');
                }
            }, 10);
        }
    );

    monitorStyle();

    if (window.location.href.indexOf("github") > 0) {
        $('.loading h3').remove();
    }

    $('.loading').addClass("hidden");
    $('.main-function').removeClass("hidden");

    $('#recipe-table').DataTable().draw(false);

    updateScrollHeight();

    window.onresize = function () {
        $('.main-nav a[data-toggle="tab"]').attr("data-init", "false");
        updateScrollHeight(true);
    };
}

function updateScrollHeight(redraw) {
    var otherHeight = $('body').height() - $('.dataTables_scrollBody:visible').height();
    var tableHeight = ($(window).height() - otherHeight - 10) + "px";
    if ($('.dataTables_scrollBody:visible').css('max-height') != tableHeight) {
        $('.dataTables_scrollBody:visible').css('max-height', tableHeight);
        redraw = true;
    }
    if (redraw) {
        $('.dataTables_scrollBody:visible table.dataTable').DataTable().columns.adjust().draw(false);
        $('.main-nav li.active a[data-toggle="tab"]').attr("data-init", "true");
    }
}

function initTableResponsiveDisplayEvent(table) {
    table.on('responsive-display', function (e, datatable, row, showHide, update) {
        datatable.fixedColumns().relayout();
        var wrapper = $(this).closest(".DTFC_ScrollWrapper");
        var scroll = wrapper.find(".dataTables_scrollBody");
        if (showHide) {
            var nextTr = $(row.node()).next("tr");
            if (nextTr.offset().top - scroll.offset().top + nextTr.outerHeight() >= scroll.height()) {
                scroll.scrollTop(nextTr.offset().top - scroll.offset().top + nextTr.outerHeight() - scroll.height() + 1 + scroll.scrollTop());
            }
        }
        wrapper.find(".DTFC_LeftBodyLiner").scrollTop(scroll.scrollTop());
    });
}

function initTableScrollEvent(pane) {
    $(pane).find(".dataTables_scrollBody").on("scroll", function (e) {
        var wrapper = $(this).closest(".DTFC_ScrollWrapper");
        if (wrapper.find(".dataTables_scrollHeadInner th.fixedcolumn").offset().left - $(this).offset().left < 0) {
            wrapper.find(".DTFC_LeftWrapper").css("display", "block");
        } else {
            wrapper.find(".DTFC_LeftWrapper").css("display", "none");
        }
        wrapper.find(".child-inner").css("margin-left", $(this).scrollLeft() + wrapper.find(".DTFC_LeftWrapper").width() + "px");
    });
}

function initTooltip() {
    $('.tooltip-pin[data-toggle="tooltip"]').tooltip(
        {
            animation: false,
            delay: { "show": 0, "hide": 0 },
            trigger: "hover"
        }
    );
    updateTooltip();
}

function updateTooltip() {
    if ($("#chk-setting-show-help").prop("checked")) {
        $('[data-toggle="tooltip"]:not(.tooltip-pin)').tooltip(
            {
                animation: false,
                delay: { "show": 0, "hide": 0 },
                trigger: "hover"
            }
        );

        $('[data-toggle="tooltip"]').on('show.bs.tooltip', function () {
            $('[data-toggle="tooltip"]').not(this).tooltip('hide');
        });
    } else {
        $('[data-toggle="tooltip"]:not(.tooltip-pin)').tooltip('destroy');
    }
}

function initSetting(data) {
    $('#chk-setting-show-help').change(function () {
        console.log("check loop change");
        updateTooltip();
        updateSettingLocalData();
    });

    $('#chk-setting-expand').change(function () {
        if (!$(this).prop("checked")) {
            $("tr.child").remove();
        }
        initRecipeShow();
        initChefShow();
        initEquipShow();
        initDecorationShow();
        if (private) {
            initCalChefsShow();
            initCalEquipsShow();
            initCalMaterialsShow();
        }
        updateSettingLocalData();
    });

    $('#chk-setting-auto-update').change(function () {
        updateSettingLocalData();
    });

    $('#chk-setting-show-final').change(function () {
        updateRecipeChefTable(data);
        updateSettingLocalData();
    });

    $('#chk-setting-done-mark').change(function () {
        $('#recipe-table').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            var recipe = this.data();
            var rankGuestInfo = getRankGuestInfo(recipe, recipe.rank);
            recipe.rankGuestsVal = rankGuestInfo.rankGuestsVal;
            recipe.rankGuestsDisp = rankGuestInfo.rankGuestsDisp;
            var rankGiftInfo = getRankGiftInfo(recipe, recipe.rank);
            recipe.rankGiftVal = rankGiftInfo.rankGiftVal;
            recipe.rankGiftDisp = rankGiftInfo.rankGiftDisp;
            this.data(recipe);
        });
        $('#recipe-table').DataTable().draw(false);
        updateSettingLocalData();
    });
}

function initRecipeTable(data) {

    reInitRecipeTable(data);

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        if ($('#chk-recipe-rarity option[value="' + rowData.rarity + '"]').is(':selected')) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $("#chk-recipe-skill").val();
        for (var i in checks) {
            if (rowData["" + checks[i] + ""] > 0) {
                return true;
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $("#chk-recipe-category").val();
        for (var i in checks) {
            if (rowData["" + checks[i] + ""]) {
                return true;
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var min = Number($('#input-recipe-price').val());
        if (rowData.oPrice >= min) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $('#chk-recipe-guest').val();
        if (checks.length == 0) {
            return true;
        }

        for (var i in checks) {
            if (rowData.guestsVal.indexOf(" " + checks[i] + " ") >= 0) {
                return true;
            } else if ($('#chk-recipe-rank-guest').prop("checked") && rowData.rankGuestsVal.indexOf(" " + checks[i] + " ") >= 0) {
                return true;
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $('#chk-recipe-antique').val();
        if (checks.length == 0) {
            return true;
        }

        for (var i in checks) {
            if (rowData.guestsVal.indexOf(checks[i]) >= 0) {
                return true;
            } else if ($('#chk-recipe-rank-antique').prop("checked") && rowData.rankGiftVal.indexOf(checks[i]) >= 0) {
                return true;
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-no-origin').prop("checked");
        if (check || !check && rowData.origin) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-combo').prop("checked");
        if (!check || check && rowData.comboVal) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-ex-no').prop("checked");
        if (!check || check && !rowData.ex) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-got').prop("checked");
        if (!check || check && rowData.got) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var value = $.trim($("#pane-recipes .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.materialsVal, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.origin, value) && rowData.origin.indexOf("神级") == -1) {
            return true;
        } else if (commaSeparatedMatch(rowData.tagsDisp, value)) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, odata, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        if (data.allSelectedMaterials.length > 0) {
            for (var i in data.allSelectedMaterials) {
                for (var j in rowData.materials) {
                    if (rowData.materials[j].material == data.allSelectedMaterials[i]) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            return true;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, odata, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        if (data.selectedQuests.length == 0) {
            return true;
        }

        for (var q in data.selectedQuests) {
            if (data.selectedQuests[q].type == "修炼任务") {
                var conditions = data.selectedQuests[q].conditions;
                for (var i in conditions) {
                    if (conditions[i].num) {
                        var limit = getMaxLimit(data, conditions[i].rarity);
                        if (limit * 2 + rowData.limitVal >= conditions[i].num) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                break;
            }
        }
        return true;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data0, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        if (data.selectedQuests.length) {
            for (var q in data.selectedQuests) {
                var oneQuest = data.selectedQuests[q].conditions;
                var onePass = false;
                for (var i in oneQuest) {
                    var pass = true;
                    if (oneQuest[i].recipeId) {
                        if (oneQuest[i].recipeId != rowData.recipeId) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].materialId) {
                        var subPass = false;
                        for (var j in rowData.materials) {
                            if (rowData.materials[j].material == oneQuest[i].materialId) {
                                subPass = true;
                                break;
                            }
                        }
                        if (!subPass) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].guest) {
                        if (rowData.guestsVal.indexOf(oneQuest[i].guest) < 0
                            && (!$('#chk-recipe-rank-guest').prop("checked") || rowData.rankGuestsVal.indexOf(oneQuest[i].guest) < 0)) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].anyGuest || oneQuest[i].newGuest) {
                        if (!rowData.guestsVal && (!$('#chk-recipe-rank-guest').prop("checked") || !rowData.rankGuestsVal)) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].skill) {
                        if (rowData["" + oneQuest[i].skill + ""] == 0) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].rarity) {
                        if (rowData.rarity < oneQuest[i].rarity) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].price) {
                        if (rowData.oPrice < oneQuest[i].price) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].category) {
                        if (!rowData["" + oneQuest[i].category + ""]) {
                            pass = false;
                        }
                    }
                    if (pass) {
                        onePass = true;
                        break;
                    }
                }
                if (!onePass) {
                    return false;
                }
            }
            return true;
        } else {
            return true;
        }
    });

    for (var j in data.materials) {
        $('#chk-recipe-show-material').append("<option value='" + data.materials[j].materialId + "'>" + data.materials[j].name + "</option>");
    }

    $('#chk-recipe-show-material').selectpicker().on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        updateRecipeTableData(data);
        if ($(this).val().length) {
            $('#recipe-table').DataTable().order([30, 'desc']); // first material eff
        }
        $('#recipe-table').DataTable().draw();
        // if (isSelected) {
        //     $(this).selectpicker('toggle');
        // }
    });

    for (var j in data.chefs) {
        $('#chk-recipe-show-chef').append("<option value='" + data.chefs[j].chefId + "'>" + data.chefs[j].name + "</option>");
    }

    $('#chk-recipe-show-chef').selectpicker().on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        $('#select-recipe-chef-quest').find('option:not([value=""])').remove();
        if ($(this).val().length == 1) {
            var chefId = $(this).val()[0];
            for (var i in data.chefs) {
                if (data.chefs[i].chefId == chefId) {
                    for (var j in data.chefs[i].ultimateGoal) {
                        for (var k in data.quests) {
                            if (data.chefs[i].ultimateGoal[j] == data.quests[k].questId) {
                                if (data.quests[k].hasOwnProperty("conditions")) {
                                    $('#select-recipe-chef-quest').append("<option value='" + data.quests[k].questId + "'>" + data.quests[k].goal + "</option>");
                                }
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
        $('#select-recipe-chef-quest').selectpicker('refresh');
        changeSelectStyle("#select-recipe-chef-quest");

        updateRecipesChefsData(data);
        updateRecipeQuest(data, true);

        // if (isSelected) {
        //     $(this).selectpicker('toggle');
        // }
    });

    $('#select-recipe-chef-quest').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        var reinit = false;
        if (!(previousValue != "" && $(this).val() != "")) {
            updateRecipesChefsData(data);
            reinit = true;
        }

        if (previousValue != $(this).val()) {
            updateRecipeQuest(data, reinit);
        }
    });

    for (var j in data.guests) {
        $('#chk-recipe-guest').append("<option value='" + data.guests[j].name + "'>" + data.guests[j].name + "</option>");
    }

    $('#chk-recipe-guest').selectpicker().on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        // if (isSelected) {
        //     $(this).selectpicker('toggle');
        // }
        $('#recipe-table').DataTable().order([14, 'asc']).draw();
    });

    $('#chk-recipe-rank-guest').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-filter-guest').click(function () {
        $('#recipe-table').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            var recipe = this.data();
            var rankGuestInfo = getRankGuestInfo(recipe, recipe.rank);
            recipe.rankGuestsVal = rankGuestInfo.rankGuestsVal;
            recipe.rankGuestsDisp = rankGuestInfo.rankGuestsDisp;
            this.data(recipe);
        });
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-antique').selectpicker().on('changed.bs.select', function () {
        $('#recipe-table').DataTable().order([14, 'asc']).draw();
    });

    $('#chk-recipe-rank-antique').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-filter-antique').click(function () {
        $('#recipe-table').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            var recipe = this.data();
            var rankGiftInfo = getRankGiftInfo(recipe, recipe.rank);
            recipe.rankGiftVal = rankGiftInfo.rankGiftVal;
            recipe.rankGiftDisp = rankGiftInfo.rankGiftDisp;
            this.data(recipe);
        });
        $('#recipe-table').DataTable().draw();
    });

    for (var i in data.activities) {
        $('#select-recipe-quest').prepend("<optgroup label='" + data.activities[i].name + "'></optgroup>");
    }

    for (var j in data.quests) {
        if (data.quests[j].hasOwnProperty("conditions")) {
            var option = "<option value='" + data.quests[j].questId + "'>" + data.quests[j].questIdDisp + ". " + data.quests[j].goal + "</option>";
            if (data.quests[j].type != "修炼任务") {
                $("#select-recipe-quest optgroup[label='" + data.quests[j].type + "']").append(option);
            }
        }
    }

    $('#select-recipe-quest').selectpicker().on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        // if (isSelected) {
        //     $(this).selectpicker('toggle');
        // }
        updateRecipeQuest(data);
    });

    $('#chk-recipe-show').on('changed.bs.select', function () {
        initRecipeShow();
        updateMenuLocalData();
    });

    $('#chk-recipe-rarity').on('changed.bs.select', function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-skill').on('changed.bs.select', function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-category').on('changed.bs.select', function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#input-recipe-price').keyup(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-combo').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-ex-no').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-got').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-no-origin').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#btn-recipe-reset').click(function () {
        $('#chk-recipe-rarity').selectpicker("selectAll");
        $("#chk-recipe-skill").selectpicker("selectAll");
        $("#chk-recipe-category").selectpicker("selectAll");
        $("#chk-recipe-combo").prop("checked", false);
        $("#chk-recipe-ex-no").prop("checked", false);
        $("#chk-recipe-got").prop("checked", false);
        $("#chk-recipe-no-origin").prop("checked", true);
        $('#input-recipe-price').val("");
        $("#chk-recipe-guest").selectpicker("deselectAll");
        $("#chk-recipe-rank-guest").prop("checked", true);
        $("#chk-recipe-antique").selectpicker("deselectAll");
        $('#chk-recipe-show-material').selectpicker("deselectAll");
        $("#pane-recipes .search-box input").val("");
        $('#chk-recipe-show-chef').selectpicker("deselectAll");
        $("#select-recipe-chef-quest").selectpicker("val", '');
        $('#select-recipe-quest').selectpicker("deselectAll");
        $('#chk-chef-partial-ultimate').selectpicker("deselectAll");

        checkMonitorStyle();

        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-apply-ex').change(function () {
        if ($(this).prop("checked")) {
            $('.recipe-apply-ex').show();
        } else {
            $('.recipe-apply-ex').hide();
        }
        updateRecipeChefTable(data);
    });

    $('#chk-recipe-apply-ex-person').change(function () {
        updateRecipeChefTable(data);
    });

    $('#btn-recipe-recal').click(function () {
        updateRecipeChefTable(data);
    });

    initRecipeShow();
}

function updateRecipeQuest(data, forceReinit) {
    $(".quest-warning").empty();
    var selectedQuests = [];
    var questMaterials = [];
    var reinit = false;
    var order = [];
    var diffOrder = false;

    var quests = $('#select-recipe-quest').val();
    var chefQuestId = $('#select-recipe-chef-quest').val();
    if (chefQuestId.length) {
        quests.push(chefQuestId);
    }

    if (quests.length) {
        var text = "";
        for (var q in quests) {
            for (var i in data.quests) {
                if (quests[q] == data.quests[i].questId) {
                    selectedQuests.push(data.quests[i]);

                    text += "[" + data.quests[i].type + "] ";
                    if (data.quests[i].type != "修炼任务") {
                        text += data.quests[i].questIdDisp + ". ";
                    }
                    text += data.quests[i].goal + " ";

                    for (var j in data.quests[i].conditions) {
                        if (data.quests[i].conditions[j].newGuest) {
                            text = text.replace(/(新的)/g, "<span class='text-danger'>$1</span>");
                        }
                        if (data.quests[i].conditions[j].rank == 2) {
                            text = text.replace(/(优级)/g, "<span class='text-danger'>$1</span>");
                        } else if (data.quests[i].conditions[j].rank == 3) {
                            text = text.replace(/(特级)/g, "<span class='text-danger'>$1</span>");
                        } else if (data.quests[i].conditions[j].rank == 4) {
                            text = text.replace(/(神级)/g, "<span class='text-danger'>$1</span>");
                        }

                        if (data.quests[i].conditions[j].num) {
                            text = text.replace(/(一次)/g, "<span class='text-danger'>$1</span>");
                            var reg = new RegExp("(" + data.quests[i].conditions[j].num + "份)", "g");
                            text = text.replace(reg, "<span class='text-danger'>$1</span>");
                        }

                        if (data.quests[i].type == "修炼任务") {
                            if (data.quests[i].conditions[j].rank == 4) {
                                diffOrder = true;
                            } else {
                                order = [14, 'asc'];  // time
                            }
                        }

                        if (data.quests[i].conditions[j].materialId && data.quests[i].conditions[j].materialEff) {
                            questMaterials.push(data.quests[i].conditions[j].materialId);
                            order = [30, 'desc'];   // first material eff
                        } else if (data.quests[i].conditions[j].materialEff) {
                            order = [19, 'desc'];   // allMaterialsEff
                        } else if (data.quests[i].conditions[j].goldEff) {
                            order = [18, 'desc'];  // efficiency
                        } else {
                            order = [14, 'asc'];  // time
                        }
                    }

                    break;
                }
            }
        }
        $(".quest-warning").append(text);
        $(".quest-warning").removeClass("hidden");
    } else {
        $(".quest-warning").addClass("hidden");
    }

    data.selectedQuests = selectedQuests;

    if (!arraysEqual(data.questMaterials, questMaterials)) {
        data.questMaterials = questMaterials;
        reinit = true;
    }

    if (reinit || forceReinit) {
        updateRecipeTableData(data);
    }

    if (diffOrder) {
        order = [[data.recipeColNum + data.recipeAddColNum - 2, 'asc'], [14, 'asc']];   // skill diff
    }

    $('#recipe-table').DataTable().order(order).draw();
    updateScrollHeight();
}

function reInitRecipeTable(data) {
    var recipeColumns = [
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "icon",
            "className": "td-recipe-icon",
            "orderable": false,
            "searchable": false
        },
        {
            "data": "name",
            "width": "86px",
            "className": "all fixedcolumn"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "className": "rarity",
            "width": "50px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "stirfry",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "boil",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "knife",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "fry",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "bake",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "steam",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "materialsVal",
                "display": "materialsDisp"
            }
        },
        {
            "data": {
                "_": "price",
                "display": "priceDisp"
            },
            "width": "30px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "exPrice",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "exTime",
                "display": "exTimeDisp"
            },
            "visible": private,
            "className": "none"
        },
        {
            "data": {
                "_": "time",
                "display": "timeDisp"
            }
        },
        {
            "data": {
                "_": "limitVal",
                "display": "limitDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "totalPrice",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "totalTime",
                "display": "totalTimeDisp"
            }
        },
        {
            "data": "efficiency",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "allMaterialsEff",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "origin"
        },
        {
            "data": "unlock"
        },
        {
            "data": {
                "_": "comboVal",
                "display": "comboDisp"
            }
        },
        {
            "data": "tagsDisp",
            "defaultContent": "",
            "visible": private,
            "className": "none"
        },
        {
            "data": {
                "_": "guestsVal",
                "display": "guestsDisp"
            }
        },
        {
            "data": {
                "_": "rankGuestsVal",
                "display": "rankGuestsDisp"
            }
        },
        {
            "data": {
                "_": "rankGiftVal",
                "display": "rankGiftDisp"
            }
        },
        {
            "data": "rank",
            "className": "nodetails",
            "width": "41px"
        },
        {
            "data": "ex",
            "className": "nodetails",
            "width": "41px"
        },
        {
            "data": "got",
            "className": "nodetails",
            "width": "41px"
        }
    ];

    var pageLength = 20;
    var searchValue = "";
    var order = [];

    if ($.fn.DataTable.isDataTable('#recipe-table')) {
        pageLength = $("#pane-recipes #recipe-table_length select").val();
        searchValue = $("#pane-recipes .search-box input").val();
        order = getTableOrder($('#recipe-table').DataTable(), recipeColumns.length);
        $('#recipe-table').DataTable().MakeCellsEditable("destroy");
        $('#recipe-table').DataTable().destroy();
    };

    $('#recipe-table').html($('#recipe-table-header').html());

    for (var i = 0; i < data.recipeAddColNumMax; i++) {
        recipeColumns.push({
            "data": {
                "_": "custom." + i + ".value",
                "display": "custom." + i + ".display"
            },
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "className": "never"
        });
        $('#recipe-table thead tr').append("<th></th>");
    }

    var recipeTable = $('#recipe-table').DataTable({
        data: data.recipes,
        columns: recipeColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 个菜谱",
            infoEmpty: "没有数据",
            infoFiltered: "(从 _MAX_ 个菜谱中过滤)"
        },
        pagingType: "numbers",
        lengthMenu: [[5, 10, 20, 50, 100, -1], [5, 10, 20, 50, 100, "所有"]],
        pageLength: pageLength,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: order,
        autoWidth: false,
        scrollX: true,
        fixedColumns: {
            leftColumns: 3
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i > 4 && i <= 9) {
                                continue;
                            } else if (i == 4) {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'>";
                                for (var j = 4; j <= 9; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            }
                            else {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                    + "<span class='child-key'>" + columns[i].title + (i == 0 || i == 1 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + (columns[i].data ? columns[i].data : i == 27 ? "无" : i == 28 || i == 29 ? "否" : "")
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }
                    var wrapper = $('#recipe-table').closest(".DTFC_ScrollWrapper");
                    var scroll = wrapper.find(".dataTables_scrollBody");
                    return data ? "<div class='child-inner' style='max-width:" + scroll.width()
                        + "px;margin-left:" + (scroll.scrollLeft() + wrapper.find(".DTFC_LeftWrapper").width()) + "px'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-recipes div.search-box").html('查找:<input type="search" value="' + searchValue + '" class="form-control input-sm monitor-none" placeholder="菜名 材料 来源"></label>');

    var rankOptions = getRankOptions();
    var gotOptions = getGotOptions();
    recipeTable.MakeCellsEditable({
        "columns": [27, 28, 29],  // rank, ex, got
        "inputTypes": [
            {
                "column": 27,
                "type": "list",
                "options": rankOptions
            },
            {
                "column": 28,
                "type": "list",
                "options": gotOptions
            },
            {
                "column": 29,
                "type": "list",
                "options": gotOptions
            }
        ],
        "onUpdate": function (table, row, cell, oldValue) {
            if (cell.index().column == 27) {// rank
                var recipe = row.data();

                var rankGuestInfo = getRankGuestInfo(recipe, recipe.rank);
                recipe.rankGuestsVal = rankGuestInfo.rankGuestsVal;
                recipe.rankGuestsDisp = rankGuestInfo.rankGuestsDisp;

                var rankGiftInfo = getRankGiftInfo(recipe, recipe.rank);
                recipe.rankGiftVal = rankGiftInfo.rankGiftVal;
                recipe.rankGiftDisp = rankGiftInfo.rankGiftDisp;

                row.data(recipe);
                recipeTable.draw();
            }

            if (cell.index().column == 28 && cell.data() != oldValue) {   // ex
                if ($("#chk-setting-auto-update").prop("checked")) {
                    updateRecipeChefTable(data);
                } else {
                    $("#btn-recipe-recal").closest(".inline-wrapper").removeClass("hidden");
                }
            }

            updateRecipesLocalData();
        }
    });

    $('#pane-recipes .search-box input').keyup(function () {
        recipeTable.draw();
        changeInputStyle(this);
    });

    initTableResponsiveDisplayEvent(recipeTable);
    initTableScrollEvent("#pane-recipes");
}

function updateRecipeTableData(data) {

    data.allSelectedMaterials = [];
    var selectedMaterials = $("#chk-recipe-show-material").val();
    for (var i in selectedMaterials) {
        data.allSelectedMaterials.push(Number(selectedMaterials[i]));
    }
    for (var i in data.questMaterials) {
        if (data.allSelectedMaterials.indexOf(data.questMaterials[i]) < 0) {
            data.allSelectedMaterials.push(data.questMaterials[i]);
        }
    }

    var chkSkillDiff = $('#select-recipe-chef-quest').val();
    var chkChefs = $('#chk-recipe-show-chef').val();

    data.recipeAddColNum = chkChefs.length * 2 + (chkSkillDiff.length > 0 ? 1 : 0) + data.allSelectedMaterials.length;
    if (data.recipeAddColNum > data.recipeAddColNumMax) {
        data.recipeAddColNumMax = data.recipeAddColNum;
        reInitRecipeTable(data);
        initRecipeShow();
        updateScrollHeight();
    }

    for (var i = 0; i < data.recipeAddColNumMax; i++) {
        $($('#recipe-table').DataTable().column(data.recipeColNum + i).header()).removeClass("all").addClass("never");
    }

    for (var i in data.recipes) {
        data.recipes[i]["custom"] = [];
        for (var m in data.allSelectedMaterials) {
            var mNum = 0;
            for (var k in data.recipes[i].materials) {
                if (data.recipes[i].materials[k].material == data.allSelectedMaterials[m]) {
                    mNum = data.recipes[i].materials[k].quantity;
                    break;
                }
            }

            var mEfficiency = 0;
            if (data.recipes[i].time > 0) {
                mEfficiency = mNum * 3600 / data.recipes[i].time;
            }
            var effDisp = mEfficiency ? Math.floor(mEfficiency) : "";

            data.recipes[i]["custom"].push({
                "display": effDisp,
                "value": mEfficiency
            });
        }

        for (var c = 0; c < chkChefs.length; c++) {
            data.recipes[i]["custom"].push({
                "display": data.recipes[i]["chefs"][c].rankDisp,
                "value": data.recipes[i]["chefs"][c].rankVal
            });

            if (chkSkillDiff.length) {
                data.recipes[i]["custom"].push({
                    "display": data.recipes[i]["chefs"][c].skillDiffDisp,
                    "value": data.recipes[i]["chefs"][c].skillDiffVal
                });
            }

            data.recipes[i]["custom"].push({
                "display": data.recipes[i]["chefs"][c].efficiency,
                "value": data.recipes[i]["chefs"][c].efficiency
            });
        }
    }

    var recipeAddColCount = 0;

    for (var m in data.allSelectedMaterials) {
        for (j in data.materials) {
            if (data.allSelectedMaterials[m] == data.materials[j].materialId) {
                $($('#recipe-table').DataTable().column(data.recipeColNum + recipeAddColCount).header()).text(data.materials[j].name + "/h").removeClass("never").addClass("all");
                recipeAddColCount++;
                break;
            }
        }
    }

    for (var i in chkChefs) {
        for (j in data.chefs) {
            if (chkChefs[i] == data.chefs[j].chefId) {
                $($('#recipe-table').DataTable().column(data.recipeColNum + recipeAddColCount).header()).text(data.chefs[j].name).removeClass("never").addClass("all");
                recipeAddColCount++;
                if (chkSkillDiff.length) {
                    $($('#recipe-table').DataTable().column(data.recipeColNum + recipeAddColCount).header()).text("神差值").removeClass("never").addClass("all");
                    recipeAddColCount++;
                }
                $($('#recipe-table').DataTable().column(data.recipeColNum + recipeAddColCount).header()).text("效率").removeClass("never").addClass("all");
                recipeAddColCount++;
                break;
            }
        }
    }

    $('#recipe-table').DataTable().clear().rows.add(data.recipes);
    $('#recipe-table').DataTable().responsive.rebuild();
    $('#recipe-table').DataTable().responsive.recalc();
    $('#recipe-table').DataTable().columns.adjust();
}

function updateRecipesChefsData(data) {
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var chkSkillDiff = $('#select-recipe-chef-quest').val();
    var chkChefs = $('#chk-recipe-show-chef').val();
    if (chkChefs.length > 0) {
        for (var i in data.recipes) {
            data.recipes[i]["chefs"] = [];
            for (var c in chkChefs) {
                for (var j in data.chefs) {
                    if (chkChefs[c] == data.chefs[j].chefId) {
                        var equip = null;
                        if (useEquip) {
                            equip = data.chefs[j].equip;
                        }
                        var resultInfo = getRecipeResult(data.chefs[j], equip, data.recipes[i], 1, 1, data.materials, null, 0);

                        var resultData = {};
                        resultData["rankVal"] = resultInfo.rankVal;
                        resultData["rankDisp"] = resultInfo.rankDisp;
                        resultData["efficiency"] = resultInfo.chefEff || "";

                        if (chkSkillDiff.length) {
                            var skillDiff = getSkillDiff(data.chefs[j], data.recipes[i], 4);
                            resultData["skillDiffDisp"] = skillDiff.disp;
                            resultData["skillDiffVal"] = skillDiff.value;
                        }

                        data.recipes[i]["chefs"].push(resultData);
                        break;
                    }
                }
            }
        }
    }
}

function getSkillDiff(chef, recipe, rank) {
    var stirfry = chef.stirfryVal - recipe.stirfry * rank;
    var boil = chef.boilVal - recipe.boil * rank;
    var knife = chef.knifeVal - recipe.knife * rank;
    var fry = chef.fryVal - recipe.fry * rank;
    var bake = chef.bakeVal - recipe.bake * rank;
    var steam = chef.steamVal - recipe.steam * rank;

    var disp = "";
    var value = 0;
    if (stirfry < 0 && recipe.stirfry > 0) {
        disp += "炒" + stirfry + " ";
        value += stirfry;
    }
    if (boil < 0 && recipe.boil > 0) {
        disp += "煮" + boil + " ";
        value += boil;
    }
    if (knife < 0 && recipe.knife > 0) {
        disp += "切" + knife + " ";
        value += knife;
    }
    if (fry < 0 && recipe.fry > 0) {
        disp += "炸" + fry + " ";
        value += fry;
    }
    if (bake < 0 && recipe.bake > 0) {
        disp += "烤" + bake + " ";
        value += bake;
    }
    if (steam < 0 && recipe.steam > 0) {
        disp += "蒸" + steam + " ";
        value += steam;
    }

    var result = {};
    result["disp"] = disp;
    result["value"] = -value;
    return result;
}

function updateChefTableData(data) {
    var chkSkillDiff = $('#chk-chef-show-skill-diff').prop("checked");
    var chkRecipes = $('#chk-chef-show-recipe').val();

    data.chefAddColNum = chkRecipes.length * (2 + (chkSkillDiff ? 1 : 0));
    if (data.chefAddColNum > data.chefAddColNumMax) {
        data.chefAddColNumMax = data.chefAddColNum;
        reInitChefTable(data);
        initChefShow();
        updateScrollHeight();
    }

    for (var i = 0; i < data.chefAddColNumMax; i++) {
        $($('#chef-table').DataTable().column(data.chefColNum + i).header()).removeClass("all").addClass("never");
    }

    for (var i in data.chefs) {
        data.chefs[i]["custom"] = [];
        for (var c = 0; c < chkRecipes.length; c++) {
            data.chefs[i]["custom"].push({
                "display": data.chefs[i]["recipes"][c].rankDisp,
                "value": data.chefs[i]["recipes"][c].rankVal
            });

            if (chkSkillDiff) {
                data.chefs[i]["custom"].push({
                    "display": data.chefs[i]["recipes"][c].skillDiffDisp,
                    "value": data.chefs[i]["recipes"][c].skillDiffVal
                });
            }

            data.chefs[i]["custom"].push({
                "display": data.chefs[i]["recipes"][c].efficiency,
                "value": data.chefs[i]["recipes"][c].efficiency
            });
        }
    }

    var chefAddColCount = 0;

    for (var i in chkRecipes) {
        for (j in data.recipes) {
            if (chkRecipes[i] == data.recipes[j].recipeId) {
                $($('#chef-table').DataTable().column(data.chefColNum + chefAddColCount).header()).text(data.recipes[j].name).removeClass("never").addClass("all");
                chefAddColCount++;
                if (chkSkillDiff) {
                    $($('#chef-table').DataTable().column(data.chefColNum + chefAddColCount).header()).text("神差值").removeClass("never").addClass("all");
                    chefAddColCount++;
                }
                $($('#chef-table').DataTable().column(data.chefColNum + chefAddColCount).header()).text("效率").removeClass("never").addClass("all");
                chefAddColCount++;
                break;
            }
        }
    }

    if (chkRecipes.length) {
        if (chkSkillDiff) {
            order = [[data.chefColNum + 1, 'asc'], [data.chefColNum + 2, 'desc']];    // diff, eff
        } else {
            order = [data.chefColNum + 1, 'desc'];   // eff
        }
        $('#chef-table').DataTable().order(order);
    }

    $('#chef-table').DataTable().clear().rows.add(data.chefs);
    $('#chef-table').DataTable().responsive.rebuild();
    $('#chef-table').DataTable().responsive.recalc();
    $('#chef-table').DataTable().columns.adjust();
}

function updateChefsRecipesData(data) {
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var chkSkillDiff = $('#chk-chef-show-skill-diff').prop("checked");
    var chkRecipes = $('#chk-chef-show-recipe').val();
    if (chkRecipes.length > 0) {
        for (var i in data.chefs) {
            data.chefs[i]["recipes"] = [];
            for (var c in chkRecipes) {
                for (var j in data.recipes) {
                    if (chkRecipes[c] == data.recipes[j].recipeId) {
                        var equip = null;
                        if (useEquip) {
                            equip = data.chefs[i].equip;
                        }
                        var resultInfo = getRecipeResult(data.chefs[i], equip, data.recipes[j], 1, 1, data.materials, null, 0);
                        var resultData = {};
                        resultData["rankVal"] = resultInfo.rankVal;
                        resultData["rankDisp"] = resultInfo.rankDisp;
                        resultData["efficiency"] = resultInfo.chefEff || "";

                        if (chkSkillDiff) {
                            var skillDiff = getSkillDiff(data.chefs[i], data.recipes[j], 4);
                            resultData["skillDiffDisp"] = skillDiff.disp;
                            resultData["skillDiffVal"] = skillDiff.value;
                        }

                        data.chefs[i]["recipes"].push(resultData);
                    }
                }
            }
        }
    }
}

function getTableOrder(table, maxColumn) {
    var retOrder = [];
    var order = table.order();
    for (var i in order) {
        var colmun = order[i][0];
        if (colmun < maxColumn) {
            retOrder.push(order[i]);
        }
    }
    return retOrder;
}

function initChefTable(data) {

    reInitChefTable(data);

    for (var j in data.recipes) {
        $('#chk-chef-show-recipe').append("<option value='" + data.recipes[j].recipeId + "'>" + data.recipes[j].name + "</option>");
    }

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        if ($('#chk-chef-rarity option[value="' + rowData.rarity + '"]').is(':selected')) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        if ($('#chk-chef-gender option[value="' + rowData.gender + '"]').is(':selected')) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var check = $('#chk-chef-no-origin').prop("checked");
        if (check || !check && rowData.origin) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var check = $('#chk-chef-got').prop("checked");
        if (!check || check && rowData.got) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var value = $.trim($("#pane-chefs .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.specialSkillDisp, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.origin, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.ultimateSkillDisp, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.tagsDisp, value)) {
            return true;
        } else {
            return false;
        }
    });

    $('#chk-chef-show-recipe').selectpicker().on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        updateChefsRecipesData(data);
        updateChefTableData(data);
        $('#chef-table').DataTable().draw();
        // if (isSelected) {
        //     $(this).selectpicker('toggle');
        // }
    });

    $('#chk-chef-show-skill-diff').click(function () {
        if ($('#chk-chef-show-recipe').val().length) {
            updateChefsRecipesData(data);
            updateChefTableData(data);
            $('#chef-table').DataTable().draw();
        }
    });

    $('#chk-chef-show').on('changed.bs.select', function () {
        initChefShow();
        updateMenuLocalData();
    });

    $('#chk-chef-rarity').on('changed.bs.select', function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-gender').on('changed.bs.select', function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-got').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-no-origin').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-apply-ultimate').change(function () {
        if ($(this).prop("checked")) {
            $('.chef-apply-ultimate').show();
        } else {
            $('.chef-apply-ultimate').hide();
        }
        updateRecipeChefTable(data);
    });

    $('#chk-chef-apply-ultimate-person').change(function () {
        updateRecipeChefTable(data);
    });

    $('#chk-chef-partial-ultimate').selectpicker().on('changed.bs.select', function () {
        updateRecipeChefTable(data);
    });

    $('#chk-chef-apply-equips').change(function () {
        updateRecipeChefTable(data);
    });

    $('#btn-chef-recal').click(function () {
        updateRecipeChefTable(data);
    });

    $('#btn-chef-reset').click(function () {
        $('#chk-chef-rarity').selectpicker("selectAll");
        $("#chk-chef-gender").selectpicker("selectAll");
        $("#chk-chef-got").prop("checked", false);
        $("#chk-chef-no-origin").prop("checked", true);
        $('#chk-chef-show-recipe').selectpicker("deselectAll");
        $("#pane-chefs .search-box input").val("");
        $('#chk-chef-partial-ultimate').selectpicker("deselectAll");
        checkMonitorStyle();
        $('#chef-table').DataTable().draw();
    });

    initChefShow();
}

function reInitChefTable(data) {
    var chefColumns = [
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "icon",
            "className": "td-chef-icon",
            "orderable": false,
            "searchable": false
        },
        {
            "data": "name",
            "width": "81px",
            "className": "all fixedcolumn"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "className": "rarity",
            "width": "50px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "stirfryVal",
                "display": "stirfryDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "boilVal",
                "display": "boilDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "knifeVal",
                "display": "knifeDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "fryVal",
                "display": "fryDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "bakeVal",
                "display": "bakeDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "steamVal",
                "display": "steamDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "specialSkillDisp"
        },
        {
            "data": {
                "_": "meatVal",
                "display": "meatDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "creationVal",
                "display": "creationDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "vegVal",
                "display": "vegDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "fishVal",
                "display": "fishDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "gender",
            "width": "30px"
        },
        {
            "data": "origin"
        },
        {
            "data": "tagsDisp",
            "defaultContent": "",
            "visible": private,
            "className": "none"
        },
        {
            "data": {
                "_": "equipName",
                "display": "equipDisp"
            },
            "className": "nodetails"
        },
        {
            "data": "ultimateGoalDisp"
        },
        {
            "data": "ultimateSkillDisp"
        },
        {
            "data": "ultimate",
            "className": "nodetails",
            "width": "41px"
        },
        {
            "data": "got",
            "className": "nodetails",
            "width": "41px"
        }
    ];

    var pageLength = 20;
    var searchValue = "";
    var order = [];

    if ($.fn.DataTable.isDataTable('#chef-table')) {
        pageLength = $("#pane-chefs #chef-table_length select").val();
        searchValue = $("#pane-chefs .search-box input").val();
        order = getTableOrder($('#chef-table').DataTable(), chefColumns.length);
        $('#chef-table').DataTable().MakeCellsEditable("destroy");
        $('#chef-table').DataTable().destroy();
    };

    $('#chef-table').html($('#chef-table-header').html());

    for (var i = 0; i < data.chefAddColNumMax; i++) {
        chefColumns.push({
            "data": {
                "_": "custom." + i + ".value",
                "display": "custom." + i + ".display"
            },
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "className": "never"
        });
        $('#chef-table thead tr').append("<th></th>");
    }

    var chefTable = $('#chef-table').DataTable({
        data: data.chefs,
        columns: chefColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 个厨师",
            infoEmpty: "没有数据",
            infoFiltered: "(从 _MAX_ 个厨师中过滤)"
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: pageLength,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: order,
        autoWidth: false,
        scrollX: true,
        fixedColumns: {
            leftColumns: 3
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i > 4 && i <= 9) {
                                continue;
                            } else if (i == 4) {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'>";
                                for (var j = 4; j <= 9; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            } else if (i > 11 && i <= 14) {
                                continue;
                            } else if (i == 11) {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'><span class='child-key'>采集：</span>";
                                for (var j = 11; j <= 14; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            }
                            else {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                    + "<span class='child-key'>" + columns[i].title + (i == 0 || i == 1 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + (columns[i].data ? columns[i].data : i == 18 ? "无" : i == 21 || i == 22 ? "否" : "")
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }
                    var wrapper = $('#chef-table').closest(".DTFC_ScrollWrapper");
                    var scroll = wrapper.find(".dataTables_scrollBody");
                    return data ? "<div class='child-inner' style='max-width:" + scroll.width()
                        + "px;margin-left:" + (scroll.scrollLeft() + wrapper.find(".DTFC_LeftWrapper").width()) + "px'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-chefs div.search-box").html('<label>查找:<input type="search" value="' + searchValue + '" class="form-control input-sm monitor-none" placeholder="名字 技能 来源"></label>');

    var gotOptions = getGotOptions();
    var equipsOptions = getEquipsOptions(data.equips, data.skills);

    chefTable.MakeCellsEditable({
        "columns": [18, 21, 22],  // equipName, ultimate, got
        "inputTypes": [
            {
                "column": 18,
                "type": "list",
                "search": true,
                "clear": true,
                "options": equipsOptions
            },
            {
                "column": 21,
                "type": "list",
                "options": gotOptions
            },
            {
                "column": 22,
                "type": "list",
                "options": gotOptions
            }
        ],
        "onUpdate": function (table, row, cell, oldValue) {
            if (cell.index().column == 18) {     // equipName
                var chef = row.data();
                var equip = null;
                var equipDisp = "";
                if (chef.equipName) {
                    for (var j in data.equips) {
                        if (chef.equipName == data.equips[j].name) {
                            equip = data.equips[j];
                            equipDisp = data.equips[j].name + "<br>" + data.equips[j].skillDisp;
                            break;
                        }
                    }
                }
                chef.equip = equip;
                chef.equipDisp = equipDisp;
                row.data(chef);
                chefTable.draw();
            }
            if ((cell.index().column == 18 || cell.index().column == 21) && cell.data() != oldValue) {   // equipName, ultimate
                if ($("#chk-setting-auto-update").prop("checked")) {
                    updateRecipeChefTable(data);
                } else {
                    $("#btn-chef-recal").closest(".inline-wrapper").removeClass("hidden");
                }
            }
            updateChefsLocalData();
        }
    });

    $('#pane-chefs .search-box input').keyup(function () {
        chefTable.draw();
        changeInputStyle(this);
    });

    initTableResponsiveDisplayEvent(chefTable);
    initTableScrollEvent("#pane-chefs");
}

function initEquipTable(data) {
    var equipColumns = [
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "icon",
            "className": "td-equip-icon",
            "orderable": false,
            "searchable": false
        },
        {
            "data": "name",
            "width": "80px",
            "className": "all fixedcolumn"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "className": "rarity",
            "width": "35px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "skillDisp",
                "sort": "skillSort"
            },
            "type": "num"
        },
        {
            "data": "origin"
        }
    ];

    var equipTable = $('#equip-table').DataTable({
        data: data.equips,
        columns: equipColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 个厨具",
            infoEmpty: "没有数据",
            infoFiltered: "(从 _MAX_ 个厨具中过滤)"
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        autoWidth: false,
        scrollX: true,
        fixedColumns: {
            leftColumns: 3
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                + "<span class='child-key'>" + columns[i].title + (i == 0 || i == 1 ? "" : "：") + "</span>"
                                + "<span class='child-value'>"
                                + columns[i].data
                                + "</span>"
                                + "</div>";
                        }
                    }
                    var wrapper = $('#equip-table').closest(".DTFC_ScrollWrapper");
                    var scroll = wrapper.find(".dataTables_scrollBody");
                    return data ? "<div class='child-inner' style='max-width:" + scroll.width()
                        + "px;margin-left:" + (scroll.scrollLeft() + wrapper.find(".DTFC_LeftWrapper").width()) + "px'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-equips div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="名字 技能 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var effects = rowData.effect;
        var checks = $("#chk-equip-skill").val();
        for (var i in checks) {
            var allPass = true;
            var values = checks[i].split(',');
            for (var j in values) {
                var exist = false;
                for (var k in effects) {
                    if (effects[k].type == values[j]) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    allPass = false;
                    break;
                }
            }
            if (allPass) {
                return true;
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var check = $('#chk-equip-fiter-all-skill').prop("checked");
        if (!check) {
            return true;
        }

        var effects = rowData.effect;
        var all = "Stirfry,Boil,Knife,Fry,Bake,Steam";
        var values = all.split(',');
        for (var j in values) {
            var exist = false;
            for (var k in effects) {
                if (effects[k].type == values[j]) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                return true;
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var check = $('#chk-equip-no-origin').prop("checked");
        if (check || !check && rowData.origin) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var value = $.trim($("#pane-equips .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.skillDisp, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.origin, value)) {
            return true;
        } else {
            return false;
        }
    });

    $('#chk-equip-show').on('changed.bs.select', function () {
        initEquipShow();
        updateMenuLocalData();
    });

    $('#chk-equip-skill').selectpicker({
        countSelectedText: function (num, total) {
            if (num < total) {
                return num + "/" + total + " 类型";
            } else {
                return "全类型";
            }
        }
    }).on('changed.bs.select', function () {
        var oneType = "";
        if ($(this).val().length == 1) {
            oneType = $(this).val()[0];
            equipTable.order([4, 'desc']);  // skill
        }

        equipTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            var rowData = this.data();
            if (oneType == "") {
                rowData.skillSort = 0;
            } else {
                for (var i in rowData.effect) {
                    if (rowData.effect[i].type == oneType
                        || oneType.indexOf(",") > 0 && oneType.split(',')[0] == rowData.effect[i].type) {
                        rowData.skillSort = rowData.effect[i].value;
                        if (rowData.effect[i].cal == "Percent") {
                            rowData.skillSort *= 10000;
                            break;
                        }
                    }
                }
            }
            this.data(rowData);
        });
        equipTable.draw();
    });

    $('#chk-equip-no-origin').click(function () {
        equipTable.draw();
    });

    $('#chk-equip-fiter-all-skill').click(function () {
        equipTable.draw();
    });

    $('#pane-equips .search-box input').keyup(function () {
        equipTable.draw();
        changeInputStyle(this);
    });

    initTableResponsiveDisplayEvent(equipTable);
    initTableScrollEvent("#pane-equips");

    initEquipShow();
}

function initDecorationTable(data) {
    var decorationColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox nodetails all',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "id",
            "width": "1px"
        },
        {
            "data": "icon",
            "className": "td-equip-icon",
            "orderable": false,
            "searchable": false
        },
        {
            "data": "name",
            "width": "145px",
            "className": "all fixedcolumn"
        },
        {
            "data": {
                "_": "gold",
                "display": "goldDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "tipMin",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "tipMax",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "tipTime",
                "display": "tipTimeDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "minEff",
            "defaultContent": "-",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "maxEff",
            "defaultContent": "-",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "avgEff",
            "defaultContent": "-",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "position"
        },
        {
            "data": {
                "_": "suit",
                "display": "suitDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "suitGold",
                "display": "suitGoldDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "origin"
        }
    ];

    var decorationTable = $('#decoration-table').DataTable({
        data: data.decorations,
        columns: decorationColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 个装饰",
            infoEmpty: "没有数据",
            infoFiltered: "(从 _MAX_ 个装饰中过滤)",
            select: {
                rows: {
                    _: "选择了 %d 个装饰",
                    0: "",
                    1: "选择了 %d 个装饰"
                }
            }
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [[0, "desc"], [10, "desc"]],  //avg eff
        deferRender: false, // for select
        autoWidth: false,
        scrollX: true,
        fixedColumns: {
            leftColumns: 4
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                + "<span class='child-key'>" + columns[i].title + (i == 1 || i == 2 ? "" : "：") + "</span>"
                                + "<span class='child-value'>"
                                + columns[i].data
                                + "</span>"
                                + "</div>";
                        }
                    }
                    var wrapper = $('#decoration-table').closest(".DTFC_ScrollWrapper");
                    var scroll = wrapper.find(".dataTables_scrollBody");
                    return data ? "<div class='child-inner' style='max-width:" + scroll.width()
                        + "px;margin-left:" + (scroll.scrollLeft() + wrapper.find(".DTFC_LeftWrapper").width()) + "px'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-decorations div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="名字 套装 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var position = rowData.position;
        if ($('#chk-decoration-position option[value="' + position + '"]').is(':selected')) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var check = $('#chk-decoration-no-origin').prop("checked");
        if (check || !check && rowData.origin) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var value = $.trim($("#pane-decorations .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.suit, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.origin, value)) {
            return true;
        } else {
            return false;
        }
    });

    $('#chk-decoration-show').on('changed.bs.select', function () {
        initDecorationShow();
        updateMenuLocalData();
    });

    $('#chk-decoration-position').selectpicker({
        countSelectedText: function (num, total) {
            if (num < total) {
                return num + "/" + total + " 位置";
            } else {
                return "全位置";
            }
        }
    }).on('changed.bs.select', function () {
        decorationTable.draw();
    });

    $('#chk-decoration-no-origin').click(function () {
        decorationTable.draw();
    });

    $('#pane-decorations .search-box input').keyup(function () {
        decorationTable.draw();
        changeInputStyle(this);
    });

    var options = "<option></option>";
    for (var i in data.suits) {
        options += "<option value='" + data.suits[i].name + "'>" + data.suits[i].name + "</option>";
    }
    $("#select-decoration-suit").append(options).selectpicker().change(function () {
        var suit = $("#select-decoration-suit").val();
        $("#select-decoration-suit").selectpicker('val', '');
        decorationTable.rows().deselect();
        decorationTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            if (this.data().suit == suit) {
                this.select();
            }
        });
        decorationTable.draw();
    });

    $('#btn-decoration-deselect-all').click(function () {
        $("#select-decoration-suit").selectpicker('val', '');
        decorationTable.rows().deselect();
    });

    decorationTable.on('user-select', function (e, dt, type, cell, originalEvent) {
        var rowIndex = cell.index().row;
        var rowData = decorationTable.rows(rowIndex).data()[0];
        decorationTable.rows({ selected: true }).every(function (rowIdx, tableLoop, rowLoop) {
            if (this.data().position == rowData.position && this.data().id != rowData.id) {
                this.deselect();
            }
        });
    });

    decorationTable.on('select', function (e, dt, type, indexes) {
        updateDecorationSum(data);
    });

    decorationTable.on('deselect', function (e, dt, type, indexes) {
        updateDecorationSum(data);
    });

    initTableResponsiveDisplayEvent(decorationTable);
    initTableScrollEvent("#pane-decorations");

    initDecorationShow();
}

function updateDecorationSum(data) {
    var selectedData = $('#decoration-table').DataTable().rows({ selected: true }).data().toArray();
    var eff = 0;
    var gold = 0;
    var suits = [];
    for (var i in selectedData) {
        if (selectedData[i].suit && suits.indexOf(selectedData[i].suit) < 0) {
            suits.push(selectedData[i].suit);
        }
        if (selectedData[i].avgEff) {
            eff += selectedData[i].avgEff;
        }
        gold += selectedData[i].gold;
    }

    var suitGold = 0;
    for (var i in suits) {
        suitGold += getSuitGold(data, selectedData, suits[i]);
    }

    var sum = "";
    if (selectedData.length) {
        sum = "平均玉璧/天:" + (+eff.toFixed(1)) + " 收入加成: " + getPercentDisp(+((gold + suitGold) * 100).toFixed(2));
    }
    $("#decoration-sum").html(sum);
}

function getSuitGold(data, selected, suit) {
    for (var i in data.suits) {
        if (data.suits[i].name == suit) {
            for (var j in data.suits[i].decorations) {
                var exist = false;
                for (var k in selected) {
                    if (data.suits[i].decorations[j] == selected[k].id) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    return 0;
                }
            }
            return data.suits[i].gold;
        }
    }
    return 0;
}

function initMaterialTable(data) {

    for (var i in data.maps) {
        $("#select-material-origin").append("<option value='" + data.maps[i].name + "'>" + data.maps[i].name + "</option>");
    }

    reInitMaterialTable(data);

    $('#select-material-origin').selectpicker().change(function () {
        reInitMaterialTable(data);
    });

    $("#chk-material-season").click(function () {
        var materialsData = getMaterialsData(data);
        $('#material-table').DataTable().clear().rows.add(materialsData).draw();
    });

    $("#input-material-addition, #input-material-skill").keyup(function () {
        var materialsData = getMaterialsData(data);
        $('#material-table').DataTable().clear().rows.add(materialsData).draw();
    });
}

function reInitMaterialTable(data) {
    var materialColumns = [
        {
            "data": "name",
            "className": "fixedcolumn"
        },
        {
            "data": "skill",
            "defaultContent": ""
        }
    ];

    if ($.fn.DataTable.isDataTable('#material-table')) {
        $('#material-table').DataTable().destroy();
    };

    var origin = $('#select-material-origin').val();

    var map;
    for (var i in data.maps) {
        if (origin == data.maps[i].name) {
            map = data.maps[i];
            break;
        }
    }

    $('#material-table thead tr').first().html("").append("<th rowspan='2'>食材</th><th rowspan='2'>点数</th>");
    $('#material-table thead tr').last().html("");
    for (var i in map.time) {
        $('#material-table thead tr').first().append("<th colspan='2'>" + secondsToTime(map.time[i]) + "</th>");
        $('#material-table thead tr').last().append("<th>最小</th><th>最大</th>");

        materialColumns.push({
            "data": "time." + i + ".0"
        });

        materialColumns.push({
            "data": "time." + i + ".1"
        });
    }

    var materialsData = getMaterialsData(data, map);

    var materialTable = $('#material-table').DataTable({
        data: materialsData,
        columns: materialColumns,
        dom: "<'row'<'col-sm-12'tr>>",
        paging: false,
        ordering: false,
        info: false,
        deferRender: true,
        autoWidth: false,
        scrollX: true,
        fixedColumns: {
            leftColumns: 1
        }
    });

    initTableScrollEvent("#pane-materials");

    materialTable.draw();
}

function initQuestTable(data) {

    for (var i in data.activities) {
        $('#select-quest-type').append("<option>" + data.activities[i].name + "</option>");
    }

    var questColumns = [
        {
            "data": "questIdDisp",
            "width": "25px",
            "className": "fixedcolumn"
        },
        {
            "data": "preId",
            "defaultContent": "",
            "orderable": false,
            "width": "35px"
        },
        {
            "data": "goal"
        },
        {
            "data": {
                "_": "rewardsVal",
                "display": "rewardsDisp"
            }
        }
    ];

    var questsData = getQuestsData(data.quests, $('#select-quest-type').val());

    var questTable = $('#quest-table').DataTable({
        data: questsData,
        columns: questColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "第 _PAGE_ 页 共 _PAGES_ 页 _TOTAL_ 个任务",
            infoEmpty: "没有数据",
            infoFiltered: "(从 _MAX_ 个任务中过滤)"
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        autoWidth: false,
        scrollX: true,
        fixedColumns: {
            leftColumns: 1
        }
    });

    $("#pane-quest div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="编号 任务 奖励"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('quest-table')) {
            return true;
        }

        var value = $.trim($("#pane-quest .search-box input").val());
        if (commaSeparatedMatch(rowData.questIdDisp.toString(), value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.goal, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.rewardsVal, value)) {
            return true;
        } else {
            return false;
        }
    });

    $('#pane-quest .search-box input').keyup(function () {
        questTable.draw();
        changeInputStyle(this);
    });

    $('#select-quest-type').selectpicker().change(function () {
        var questsData = getQuestsData(data.quests, $(this).val());
        questTable.clear().rows.add(questsData).draw();
        initQuestShow(questTable);
    });

    initTableScrollEvent("#pane-quest");

    initQuestShow(questTable);
}

function initImportExport(data) {
    $('#btn-export').click(function () {
        $("#input-export-import").val(generateExportData());
    });
    $('#btn-import').click(function () {
        $("#import-msg-2").html("导入中...").removeClass("hidden");
        setTimeout(function () {
            var success = importData(data, $("#input-export-import").val());
            if (success) {
                $("#input-export-import").val("");
                $("#import-msg-2").html("导入成功 !");
            } else {
                $("#import-msg-2").html("导入失败 !");
            }
        }, 0);
    });

    $('#btn-export-download').click(function () {
        var blob = new Blob([generateExportData()], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "food.txt");
    });

    $('#file-import').change(function () {
        $("#import-msg").html("导入中...").removeClass("hidden");
        setTimeout(function () {
            var file = document.getElementById("file-import").files[0];
            var reader = new FileReader();
            reader.onload = function (event) {
                var success = importData(data, event.target.result);
                if (success) {
                    $("#import-msg").html("导入成功 !");
                } else {
                    $("#import-msg").html("导入失败 !");
                }
            };
            reader.readAsText(file, "UTF-8");
            $(this).val("");
        }, 0);
    });
}

function importData(data, input) {
    var person;
    try {
        person = JSON.parse(input);
    } catch (e) {
        return false;
    }

    for (var i in data.recipes) {
        for (var j in person.recipes) {
            if (data.recipes[i].recipeId == person.recipes[j].id) {
                if (person.recipes[j].hasOwnProperty("rank")) {
                    data.recipes[i].rank = person.recipes[j].rank;
                    var rankGuestInfo = getRankGuestInfo(data.recipes[i], data.recipes[i].rank);
                    data.recipes[i].rankGuestsVal = rankGuestInfo.rankGuestsVal;
                    data.recipes[i].rankGuestsDisp = rankGuestInfo.rankGuestsDisp;

                    var rankGiftInfo = getRankGiftInfo(data.recipes[i], data.recipes[i].rank);
                    data.recipes[i].rankGiftVal = rankGiftInfo.rankGiftVal;
                    data.recipes[i].rankGiftDisp = rankGiftInfo.rankGiftDisp;
                }
                if (person.recipes[j].hasOwnProperty("ex")) {
                    data.recipes[i].ex = person.recipes[j].ex;
                }
                if (person.recipes[j].hasOwnProperty("got")) {
                    data.recipes[i].got = person.recipes[j].got;
                }
                break;
            }
        }

        for (var j in person.recipesTags) {
            if (data.recipes[i].recipeId == person.recipesTags[j].recipeId) {
                data.recipes[i].tags = person.recipesTags[j].tags;
                data.recipes[i].tagsDisp = getTagsDisp(person.recipesTags[j].tags, person.tags);
                data.recipes[i].exTime = person.recipesTags[j].experienceTime;
                data.recipes[i].exTimeDisp = getExTimeDisp(person.recipesTags[j].experienceTime, data.recipes[i].time);
                break;
            }
        }
    }

    for (var i in data.chefs) {
        for (var j in person.chefs) {
            if (data.chefs[i].chefId == person.chefs[j].id) {
                if (person.chefs[j].hasOwnProperty("got")) {
                    data.chefs[i].got = person.chefs[j].got;
                }
                if (person.chefs[j].hasOwnProperty("ult")) {
                    data.chefs[i].ultimate = person.chefs[j].ult;
                }
                if (person.chefs[j].hasOwnProperty("equip")) {
                    for (var k in data.equips) {
                        if (person.chefs[j].equip == data.equips[k].equipId) {
                            data.chefs[i].equip = data.equips[k];
                            data.chefs[i].equipName = data.equips[k].name;
                            data.chefs[i].equipDisp = data.equips[k].name + "<br>" + data.equips[k].skillDisp;
                            break;
                        }
                    }
                } else {
                    data.chefs[i].equip = null;
                }
                break;
            }
        }

        for (var j in person.chefsTags) {
            if (data.chefs[i].chefId == person.chefsTags[j].chefId) {
                data.chefs[i].tags = person.chefsTags[j].tags;
                data.chefs[i].tagsDisp = getTagsDisp(person.chefsTags[j].tags, person.tags);
                break;
            }
        }
    }

    var options = "";
    for (var i in person.rules) {
        var exist = false;
        for (var j in data.rules) {
            if (person.rules[i].Id == data.rules[j].Id) {
                data.rules[j] = person.rules[i];
                exist = true;
                break;
            }
        }
        if (!exist) {
            data.rules.push(person.rules[i]);
            options += "<option value='" + person.rules[i].Id + "'>" + person.rules[i].Title + "</option>";
        }
    }
    $("#select-cal-rule").append(options).selectpicker('refresh');

    if (person.calEquips) {
        $('#cal-equips-table').DataTable().rows().deselect();
        $('#cal-equips-table').DataTable().rows(function (idx, data, node) {
            for (var i in person.calEquips) {
                if (data.equipId == person.calEquips[i]) {
                    return true;
                }
            }
            return false;
        }).select();
    }

    updateMenu(person);
    updateSetting(person);

    if (person.decorationEffect) {
        data.decorationEffect = person.decorationEffect;
        $("#input-cal-decoration").val(person.decorationEffect || "");
    }

    try {
        localStorage.setItem('data', generateExportData());
    } catch (e) { }

    data = getUpdateData(data);

    updateRecipeTableData(data);
    updateChefTableData(data);
    initRecipeShow();
    initChefShow();
    initEquipShow();

    return true;
}

function updateRecipesLocalData() {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }

    person["recipes"] = generateRecipesExportData();

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function updateChefsLocalData() {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }

    person["chefs"] = generateChefsExportData();

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function updateMenuLocalData() {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }

    person["menu"] = generateMenuExportData();

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function updateSettingLocalData() {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }

    person["setting"] = generateSettingExportData();

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function updateDecorationLocalData() {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }

    person["decorationEffect"] = Number($("#input-cal-decoration").val());

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function updateLocalData(key, value) {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }

    person[key] = value;

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function generateExportData() {
    var person = {};
    person["recipes"] = generateRecipesExportData();
    person["chefs"] = generateChefsExportData();
    person["menu"] = generateMenuExportData();
    person["setting"] = generateSettingExportData();
    person["decorationEffect"] = Number($("#input-cal-decoration").val());

    return JSON.stringify(person);
}

function generateRecipesExportData() {
    var exportRecipes = [];
    var recipes = $('#recipe-table').DataTable().data().toArray();
    for (var i in recipes) {
        var recipe = {};
        recipe["id"] = recipes[i].recipeId;
        recipe["rank"] = recipes[i].rank;
        recipe["ex"] = recipes[i].ex;
        recipe["got"] = recipes[i].got;
        exportRecipes.push(recipe);
    }
    return exportRecipes;
}

function generateChefsExportData() {
    var exportChefs = [];
    var chefs = $('#chef-table').DataTable().data().toArray();
    for (var i in chefs) {
        var chef = {};
        chef["id"] = chefs[i].chefId;
        chef["got"] = chefs[i].got;
        chef["ult"] = chefs[i].ultimate;
        if (chefs[i].equip) {
            chef["equip"] = chefs[i].equip.equipId;
        }
        exportChefs.push(chef);
    }
    return exportChefs;
}

function generateMenuExportData() {
    var exportData = {};
    exportData["version"] = 1;
    exportData["recipe"] = $("#chk-recipe-show").val();
    exportData["chef"] = $("#chk-chef-show").val();
    exportData["equip"] = $("#chk-equip-show").val();
    exportData["decoration"] = $("#chk-decoration-show").val();
    return exportData;
}

function updateMenu(person) {
    if (person && person.menu && person.menu.version == 1) {
        $("#chk-recipe-show").selectpicker('val', person.menu.recipe)
        $("#chk-chef-show").selectpicker('val', person.menu.chef);
        $("#chk-equip-show").selectpicker('val', person.menu.equip);
        $("#chk-decoration-show").selectpicker('val', person.menu.decoration);
    }
}

function generateSettingExportData() {
    var exportData = {};
    exportData["help"] = $("#chk-setting-show-help").prop("checked");
    exportData["expand"] = $("#chk-setting-expand").prop("checked");
    exportData["auto"] = $("#chk-setting-auto-update").prop("checked");
    exportData["final"] = $("#chk-setting-show-final").prop("checked");
    exportData["mark"] = $("#chk-setting-done-mark").prop("checked");
    return exportData;
}

function updateSetting(person) {
    if (person && person.setting) {
        if ($('#chk-setting-show-help').prop("checked") != person.setting.help) {
            if (person.setting.help) {
                $('#chk-setting-show-help').bootstrapToggle('on');
            } else {
                $('#chk-setting-show-help').bootstrapToggle('off');
            }
        }
        if ($('#chk-setting-expand').prop("checked") != person.setting.expand) {
            if (person.setting.expand) {
                $('#chk-setting-expand').bootstrapToggle('on');
            } else {
                $('#chk-setting-expand').bootstrapToggle('off');
            }
        }
        if ($('#chk-setting-auto-update').prop("checked") != person.setting.auto) {
            if (person.setting.auto) {
                $('#chk-setting-auto-update').bootstrapToggle('on');
            } else {
                $('#chk-setting-auto-update').bootstrapToggle('off');
            }
        }
        if ($('#chk-setting-show-final').prop("checked") != person.setting.final) {
            if (person.setting.final) {
                $('#chk-setting-show-final').bootstrapToggle('on');
            } else {
                $('#chk-setting-show-final').bootstrapToggle('off');
            }
        }
        if ($('#chk-setting-done-mark').prop("checked") != person.setting.mark) {
            if (person.setting.mark) {
                $('#chk-setting-done-mark').bootstrapToggle('on');
            } else {
                $('#chk-setting-done-mark').bootstrapToggle('off');
            }
        }
    }
}

function initCalTables(data) {

    setSelfUltimateOptions(data.chefs, data.skills);
    setExOptions(data.recipes);
    initCalResultsTable(data);
    initCalRules(data);

    if (private) {
        $("#pane-cal").addClass("admin");

        initCalChefsTable(data);
        initCalEquipsTable(data);
        initCalMaterialsTable(data);

        $('#input-cal-thread').val(navigator.hardwareConcurrency);
    }
}

function initCalRules(data) {
    var options = "";
    for (var i in data.rules) {
        options += "<option value='" + data.rules[i].Id + "'>" + data.rules[i].Title + "</option>";
    }
    $("#select-cal-rule").append(options).selectpicker().change(function () {
        $("#btn-cal-rule-load").removeClass("btn-default").addClass("btn-danger");
    });

    $("#input-cal-decoration").val(data.decorationEffect || "");

    loadUltimate(data, true);

    $("#btn-cal-rule-load").click(function () {
        var ruleId = Math.floor($("#select-cal-rule").val());
        for (var i in data.rules) {
            if (data.rules[i].Id == ruleId) {
                currentRule = data.rules[i];
                break;
            }
        }
        if (!currentRule) {
            return;
        }

        $("#btn-cal-rule-load").prop("disabled", true);
        $('.loading').removeClass("hidden");
        $(".cal-results-wrapper").addClass("hidden");

        setTimeout(function () {

            loadRule(data, currentRule);
            setCalConfigData(currentRule, data);
            initCalCustomOptions(currentRule, data);

            $('.loading').addClass("hidden");
            $(".cal-menu").removeClass("hidden");
            $("#pane-cal-self-select .cal-results-wrapper").removeClass("hidden");
            $("#pane-cal-recipes-results .cal-results-wrapper").removeClass("hidden");
            $("#btn-cal-rule-load").prop("disabled", false).removeClass("btn-danger").addClass("btn-default");

        }, 0);

    });

    $("#btn-cal-update").click(function () {

        $("#btn-cal-decoration").prop("disabled", true);
        $("#btn-cal-rule-load").prop("disabled", true);
        $('.loading').removeClass("hidden");
        $(".cal-results-wrapper").addClass("hidden");

        setTimeout(function () {

            setCalConfigData(currentRule, data);
            calCustomResults(currentRule, data);

            $('.loading').addClass("hidden");
            $("#pane-cal-self-select .cal-results-wrapper").removeClass("hidden");
            $("#pane-cal-recipes-results .cal-results-wrapper").removeClass("hidden");
            $("#btn-cal-rule-load").prop("disabled", false);
            $("#btn-cal-decoration").prop("disabled", false);

        }, 0);
    });

    $("#input-cal-decoration").keyup(function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
        updateDecorationLocalData();
    });

    $("#cal-ultimate input").keyup(function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
    });

    $('#chk-cal-partial-ultimate').selectpicker().on('changed.bs.select', function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
    });

    $('#chk-cal-self-ultimate').selectpicker().on('changed.bs.select', function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
    });

    $('#chk-cal-ex').selectpicker().on('changed.bs.select', function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
    });

    $("#btn-cal-load-ultimate").click(function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
        $("#cal-ultimate input").val("");
        loadUltimate(data, true);
    });

    $("#btn-cal-load-all-ultimate").click(function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
        $("#cal-ultimate input").val("");
        loadUltimate(data, false);
    });

    $("#btn-cal-clear-ultimate").click(function () {
        $("#btn-cal-update").removeClass("btn-default").addClass("btn-danger");
        $("#cal-ultimate input").val("");
        $('#chk-cal-partial-ultimate').selectpicker('deselectAll');
        $('#chk-cal-self-ultimate').selectpicker('deselectAll');
        $('#chk-cal-ex').selectpicker('deselectAll');
    });

    $("#chk-cal-got").click(function () {
        $('#cal-recipes-results-table').DataTable().draw();
        initCalCustomOptions(currentRule, data);
    });

    $("#chk-cal-no-origin").click(function () {
        $('#cal-recipes-results-table').DataTable().draw();
        initCalCustomOptions(currentRule, data);
    });

    $('#select-cal-order').change(function () {
        initCalCustomOptions(currentRule, data);
        sortRecipesResult();
    });

    $("#btn-cal-clear-custom").click(function () {
        var table = $('#cal-self-select-table').DataTable();
        var custom = table.data().toArray();
        for (var i in custom) {
            custom[i].chef.name = "";
            custom[i].equip.name = "";
            custom[i].recipe.data.name = "";
        }
        calCustomResults(currentRule, data);
    });
}

function loadUltimate(data, usePerson) {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    var ultimateData = getUltimateData(data.chefs, person, data.skills, true, usePerson);
    var globalUltimate = ultimateData.global;

    for (var i in globalUltimate) {
        if (globalUltimate[i].type == "Stirfry" && !globalUltimate[i].tag) {
            $("#input-cal-ultimate-stirfry").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "Boil" && !globalUltimate[i].tag) {
            $("#input-cal-ultimate-boil").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "Knife" && !globalUltimate[i].tag) {
            $("#input-cal-ultimate-knife").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "Fry" && !globalUltimate[i].tag) {
            $("#input-cal-ultimate-fry").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "Bake" && !globalUltimate[i].tag) {
            $("#input-cal-ultimate-bake").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "Steam" && !globalUltimate[i].tag) {
            $("#input-cal-ultimate-steam").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].tag == 1) {
            $("#input-cal-ultimate-male-skill").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].tag == 2) {
            $("#input-cal-ultimate-female-skill").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "MaxEquipLimit" && globalUltimate[i].rarity == 1) {
            $("#input-cal-ultimate-1-limit").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "MaxEquipLimit" && globalUltimate[i].rarity == 2) {
            $("#input-cal-ultimate-2-limit").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "MaxEquipLimit" && globalUltimate[i].rarity == 3) {
            $("#input-cal-ultimate-3-limit").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "MaxEquipLimit" && globalUltimate[i].rarity == 4) {
            $("#input-cal-ultimate-4-limit").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "MaxEquipLimit" && globalUltimate[i].rarity == 5) {
            $("#input-cal-ultimate-5-limit").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "UseAll" && globalUltimate[i].rarity == 2) {
            $("#input-cal-ultimate-2-price").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "UseAll" && globalUltimate[i].rarity == 3) {
            $("#input-cal-ultimate-3-price").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "UseAll" && globalUltimate[i].rarity == 4) {
            $("#input-cal-ultimate-4-price").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "UseAll" && globalUltimate[i].rarity == 5) {
            $("#input-cal-ultimate-5-price").val(globalUltimate[i].value);
            continue;
        } else if (globalUltimate[i].type == "Material_Gain") {
            continue
        } else {
            console.log(globalUltimate[i].type);
        }
    }

    var partialUltimate = ultimateData.partial;
    var partialIds = [];
    for (var i in partialUltimate) {
        partialIds.push(partialUltimate[i].chefId);
    }
    $('#chk-cal-partial-ultimate').selectpicker('val', partialIds);

    var selfUltimate = ultimateData.self;
    var selfIds = [];
    for (var i in selfUltimate) {
        selfIds.push(selfUltimate[i].chefId);
    }
    $('#chk-cal-self-ultimate').selectpicker('val', selfIds);

    var exRecipeIds = [];
    for (var i in data.recipes) {
        if (usePerson && data.recipes[i].ex == "是" || !usePerson) {
            exRecipeIds.push(data.recipes[i].recipeId);
        }
    }
    $('#chk-cal-ex').selectpicker('val', exRecipeIds);
}

function setCalConfigData(rule, data) {
    $("#btn-cal-update").removeClass("btn-danger").addClass("btn-default");

    rule["decorationEffect"] = Number($("#input-cal-decoration").val());

    var globalUltimate = [];

    var stirfry = Number($("#input-cal-ultimate-stirfry").val());
    if (stirfry) {
        var ultimateItem = {};
        ultimateItem["type"] = "Stirfry";
        ultimateItem["value"] = stirfry;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        globalUltimate.push(ultimateItem);
    }

    var boil = Number($("#input-cal-ultimate-boil").val());
    if (boil) {
        var ultimateItem = {};
        ultimateItem["type"] = "Boil";
        ultimateItem["value"] = boil;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        globalUltimate.push(ultimateItem);
    }

    var knife = Number($("#input-cal-ultimate-knife").val());
    if (knife) {
        var ultimateItem = {};
        ultimateItem["type"] = "Knife";
        ultimateItem["value"] = knife;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        globalUltimate.push(ultimateItem);
    }

    var fry = Number($("#input-cal-ultimate-fry").val());
    if (fry) {
        var ultimateItem = {};
        ultimateItem["type"] = "Fry";
        ultimateItem["value"] = fry;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        globalUltimate.push(ultimateItem);
    }

    var bake = Number($("#input-cal-ultimate-bake").val());
    if (bake) {
        var ultimateItem = {};
        ultimateItem["type"] = "Bake";
        ultimateItem["value"] = bake;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        globalUltimate.push(ultimateItem);
    }

    var steam = Number($("#input-cal-ultimate-steam").val());
    if (steam) {
        var ultimateItem = {};
        ultimateItem["type"] = "Steam";
        ultimateItem["value"] = steam;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        globalUltimate.push(ultimateItem);
    }

    var maleSkill = Number($("#input-cal-ultimate-male-skill").val());
    if (maleSkill) {
        var ultimateItem1 = {};
        ultimateItem1["type"] = "Stirfry";
        ultimateItem1["value"] = maleSkill;
        ultimateItem1["condition"] = "Global";
        ultimateItem1["cal"] = "Abs";
        ultimateItem1["tag"] = 1;
        globalUltimate.push(ultimateItem1);
        var ultimateItem2 = {};
        ultimateItem2["type"] = "Boil";
        ultimateItem2["value"] = maleSkill;
        ultimateItem2["condition"] = "Global";
        ultimateItem2["cal"] = "Abs";
        ultimateItem2["tag"] = 1;
        globalUltimate.push(ultimateItem2);
        var ultimateItem3 = {};
        ultimateItem3["type"] = "Knife";
        ultimateItem3["value"] = maleSkill;
        ultimateItem3["condition"] = "Global";
        ultimateItem3["cal"] = "Abs";
        ultimateItem3["tag"] = 1;
        globalUltimate.push(ultimateItem3);
        var ultimateItem4 = {};
        ultimateItem4["type"] = "Fry";
        ultimateItem4["value"] = maleSkill;
        ultimateItem4["condition"] = "Global";
        ultimateItem4["cal"] = "Abs";
        ultimateItem4["tag"] = 1;
        globalUltimate.push(ultimateItem4);
        var ultimateItem5 = {};
        ultimateItem5["type"] = "Bake";
        ultimateItem5["value"] = maleSkill;
        ultimateItem5["condition"] = "Global";
        ultimateItem5["cal"] = "Abs";
        ultimateItem5["tag"] = 1;
        globalUltimate.push(ultimateItem5);
        var ultimateItem6 = {};
        ultimateItem6["type"] = "Steam";
        ultimateItem6["value"] = maleSkill;
        ultimateItem6["condition"] = "Global";
        ultimateItem6["cal"] = "Abs";
        ultimateItem6["tag"] = 1;
        globalUltimate.push(ultimateItem6);
    }

    var femaleSkill = Number($("#input-cal-ultimate-female-skill").val());
    if (femaleSkill) {
        var ultimateItem1 = {};
        ultimateItem1["type"] = "Stirfry";
        ultimateItem1["value"] = femaleSkill;
        ultimateItem1["condition"] = "Global";
        ultimateItem1["cal"] = "Abs";
        ultimateItem1["tag"] = 2;
        globalUltimate.push(ultimateItem1);
        var ultimateItem2 = {};
        ultimateItem2["type"] = "Boil";
        ultimateItem2["value"] = femaleSkill;
        ultimateItem2["condition"] = "Global";
        ultimateItem2["cal"] = "Abs";
        ultimateItem2["tag"] = 2;
        globalUltimate.push(ultimateItem2);
        var ultimateItem3 = {};
        ultimateItem3["type"] = "Knife";
        ultimateItem3["value"] = femaleSkill;
        ultimateItem3["condition"] = "Global";
        ultimateItem3["cal"] = "Abs";
        ultimateItem3["tag"] = 2;
        globalUltimate.push(ultimateItem3);
        var ultimateItem4 = {};
        ultimateItem4["type"] = "Fry";
        ultimateItem4["value"] = femaleSkill;
        ultimateItem4["condition"] = "Global";
        ultimateItem4["cal"] = "Abs";
        ultimateItem4["tag"] = 2;
        globalUltimate.push(ultimateItem4);
        var ultimateItem5 = {};
        ultimateItem5["type"] = "Bake";
        ultimateItem5["value"] = femaleSkill;
        ultimateItem5["condition"] = "Global";
        ultimateItem5["cal"] = "Abs";
        ultimateItem5["tag"] = 2;
        globalUltimate.push(ultimateItem5);
        var ultimateItem6 = {};
        ultimateItem6["type"] = "Steam";
        ultimateItem6["value"] = femaleSkill;
        ultimateItem6["condition"] = "Global";
        ultimateItem6["cal"] = "Abs";
        ultimateItem6["tag"] = 2;
        globalUltimate.push(ultimateItem6);
    }

    var limit1 = Number($("#input-cal-ultimate-1-limit").val());
    if (limit1) {
        var ultimateItem = {};
        ultimateItem["type"] = "MaxEquipLimit";
        ultimateItem["value"] = limit1;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        ultimateItem["rarity"] = 1;
        globalUltimate.push(ultimateItem);
    }

    var limit2 = Number($("#input-cal-ultimate-2-limit").val());
    if (limit2) {
        var ultimateItem = {};
        ultimateItem["type"] = "MaxEquipLimit";
        ultimateItem["value"] = limit2;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        ultimateItem["rarity"] = 2;
        globalUltimate.push(ultimateItem);
    }

    var limit3 = Number($("#input-cal-ultimate-3-limit").val());
    if (limit3) {
        var ultimateItem = {};
        ultimateItem["type"] = "MaxEquipLimit";
        ultimateItem["value"] = limit3;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        ultimateItem["rarity"] = 3;
        globalUltimate.push(ultimateItem);
    }

    var limit4 = Number($("#input-cal-ultimate-4-limit").val());
    if (limit4) {
        var ultimateItem = {};
        ultimateItem["type"] = "MaxEquipLimit";
        ultimateItem["value"] = limit4;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        ultimateItem["rarity"] = 4;
        globalUltimate.push(ultimateItem);
    }

    var limit5 = Number($("#input-cal-ultimate-5-limit").val());
    if (limit5) {
        var ultimateItem = {};
        ultimateItem["type"] = "MaxEquipLimit";
        ultimateItem["value"] = limit5;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Abs";
        ultimateItem["rarity"] = 5;
        globalUltimate.push(ultimateItem);
    }

    var price2 = Number($("#input-cal-ultimate-2-price").val());
    if (price2) {
        var ultimateItem = {};
        ultimateItem["type"] = "UseAll";
        ultimateItem["value"] = price2;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Percent";
        ultimateItem["rarity"] = 2;
        globalUltimate.push(ultimateItem);
    }

    var price3 = Number($("#input-cal-ultimate-3-price").val());
    if (price3) {
        var ultimateItem = {};
        ultimateItem["type"] = "UseAll";
        ultimateItem["value"] = price3;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Percent";
        ultimateItem["rarity"] = 3;
        globalUltimate.push(ultimateItem);
    }

    var price4 = Number($("#input-cal-ultimate-4-price").val());
    if (price4) {
        var ultimateItem = {};
        ultimateItem["type"] = "UseAll";
        ultimateItem["value"] = price4;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Percent";
        ultimateItem["rarity"] = 4;
        globalUltimate.push(ultimateItem);
    }

    var price5 = Number($("#input-cal-ultimate-5-price").val());
    if (price5) {
        var ultimateItem = {};
        ultimateItem["type"] = "UseAll";
        ultimateItem["value"] = price5;
        ultimateItem["condition"] = "Global";
        ultimateItem["cal"] = "Percent";
        ultimateItem["rarity"] = 5;
        globalUltimate.push(ultimateItem);
    }

    var partialChefIds = $('#chk-cal-partial-ultimate').val();
    for (var i in partialChefIds) {
        partialChefIds[i] = Number(partialChefIds[i]);
    }
    var selfPartialUltimateData = getPartialUltimateData(data.chefs, data.partialSkill, true, partialChefIds);

    var selfChefIds = $('#chk-cal-self-ultimate').val();
    for (var i in selfChefIds) {
        selfChefIds[i] = Number(selfChefIds[i]);
    }
    var selfUltimateData = getSelfUltimateData(data.chefs, data.skills, true, selfChefIds);

    rule["calGlobalUltimateData"] = globalUltimate;
    rule["calPartialChefIds"] = partialChefIds;
    rule["calSelfUltimateData"] = selfUltimateData;

    var exRecipeIds = $('#chk-cal-ex').val();
    for (var i in exRecipeIds) {
        exRecipeIds[i] = Number(exRecipeIds[i]);
    }

    for (var i in rule.menus) {
        var useEx = exRecipeIds.indexOf(rule.menus[i].recipe.data.recipeId) >= 0;
        setDataForRecipe(rule.menus[i].recipe.data, globalUltimate, useEx, false);

        var quantity = getRecipeQuantity(rule.menus[i].recipe.data, rule.materials, rule);

        var resultData = getRecipeResult(null, null, rule.menus[i].recipe.data, quantity, quantity, rule.materials, rule, rule.decorationEffect);
        resultData["available"] = quantity;
        resultData["availableScore"] = resultData.totalScore / resultData.max * quantity;

        rule.menus[i].recipe = resultData;
    }

    for (var i in rule.chefs) {
        setDataForChef(rule.chefs[i], null, false, globalUltimate, selfPartialUltimateData, null, selfUltimateData, false);
    }
}

function loadRule(data, rule) {
    if (rule.DisableDecorationEffect) {
        $("#input-cal-decoration").prop("disabled", true);
        $("#btn-cal-decoration").prop("disabled", true);
    } else {
        $("#input-cal-decoration").prop("disabled", false);
        $("#btn-cal-decoration").prop("disabled", false);
    }

    var allRecipes = JSON.parse(JSON.stringify(data.recipes));
    var allChefs = JSON.parse(JSON.stringify(data.chefs));
    var allEquips = JSON.parse(JSON.stringify(data.equips));
    var allMaterials = JSON.parse(JSON.stringify(data.materials));

    for (var i in rule.MaterialsEffect) {
        for (var j in allMaterials) {
            if (allMaterials[j].materialId == rule.MaterialsEffect[i].MaterialID) {
                allMaterials[j].addition = +(Number(allMaterials[j].addition) + rule.MaterialsEffect[i].Effect).toFixed(2);
                break;
            }
        }
    }

    var materials = [];
    if (rule.hasOwnProperty("MaterialsNum")) {
        for (var i in rule.MaterialsNum) {
            for (var j in allMaterials) {
                if (allMaterials[j].materialId == rule.MaterialsNum[i].MaterialID) {
                    if (rule.MaterialsNum[i].Num != 1) {
                        allMaterials[j].quantity = rule.MaterialsNum[i].Num;
                    }
                    materials.push(allMaterials[j]);
                    break;
                }

            }
        }
    } else {
        for (var i in allMaterials) {
            materials.push(allMaterials[i]);
        }
    }

    var recipes = [];
    for (var i in allRecipes) {

        if (allRecipes[i].hide) {
            continue;
        }

        if (rule.hasOwnProperty("CookbookRarityLimit")) {
            if (allRecipes[i].rarity > rule.CookbookRarityLimit) {
                continue;
            }
        }

        var quantity = getRecipeQuantity(allRecipes[i], materials, rule);
        if (quantity == 0) {
            continue;
        }

        if (rule.hasOwnProperty("RecipesTagsEffect")) {
            for (var j in allRecipes[i].tags) {
                for (var k in rule.RecipesTagsEffect) {
                    if (allRecipes[i].tags[j] == rule.RecipesTagsEffect[k].TagID) {
                        allRecipes[i].addition = +(Number(allRecipes[i].addition) + rule.RecipesTagsEffect[k].Effect).toFixed(2);
                    }
                }
            }
        }

        for (var k in rule.RecipesEffect) {
            if (allRecipes[i].recipeId == rule.RecipesEffect[k].RecipeID) {
                allRecipes[i].addition = +(Number(allRecipes[i].addition) + rule.RecipesEffect[k].Effect).toFixed(2);
            }
        }

        for (var k in rule.RecipesSkillsEffect) {
            if (rule.RecipesSkillsEffect[k].Skill == "stirfry" && allRecipes[i].stirfry > 0
                || rule.RecipesSkillsEffect[k].Skill == "boil" && allRecipes[i].boil > 0
                || rule.RecipesSkillsEffect[k].Skill == "knife" && allRecipes[i].knife > 0
                || rule.RecipesSkillsEffect[k].Skill == "fry" && allRecipes[i].fry > 0
                || rule.RecipesSkillsEffect[k].Skill == "bake" && allRecipes[i].bake > 0
                || rule.RecipesSkillsEffect[k].Skill == "steam" && allRecipes[i].steam > 0) {
                allRecipes[i].addition = +(Number(allRecipes[i].addition) + rule.RecipesSkillsEffect[k].Effect).toFixed(2);
            }
        }

        recipes.push(allRecipes[i]);
    }

    var chefs = [];
    for (var i in allChefs) {

        if (allChefs[i].hide) {
            continue;
        }

        if (rule.hasOwnProperty("ChefRarityLimit")) {
            if (allChefs[i].rarity > rule.ChefRarityLimit) {
                continue;
            }
        }

        var valid = false;

        if (rule.hasOwnProperty("EnableChefTags")) {
            for (var j in rule.EnableChefTags) {
                if (allChefs[i].tags.indexOf(rule.EnableChefTags[j]) >= 0) {
                    valid = true;
                    break;
                }
            }
        } else {
            valid = true;
        }

        if (!valid) {
            continue;
        }

        if (rule.hasOwnProperty("ChefsTagsEffect")) {
            for (var j in allChefs[i].tags) {
                for (var k in rule.ChefsTagsEffect) {
                    if (allChefs[i].tags[j] == rule.ChefsTagsEffect[k].TagID) {
                        allChefs[i].addition = +(Number(allChefs[i].addition) + rule.ChefsTagsEffect[k].Effect).toFixed(2);
                    }
                }
            }
        }

        chefs.push(allChefs[i]);
    }

    var equips = [];
    for (var i in allEquips) {

        if (allEquips[i].hide) {
            continue;
        }

        equips.push(allEquips[i]);
    }

    rule["recipes"] = recipes;
    rule["chefs"] = chefs;
    rule["equips"] = equips;
    rule["materials"] = materials;
    rule["rest"] = materials;

    var menus = [];
    for (var j in rule.recipes) {
        var quantity = getRecipeQuantity(rule.recipes[j], rule.materials, rule);

        var resultData = getRecipeResult(null, null, rule.recipes[j], quantity, quantity, rule.materials, rule, rule.decorationEffect);
        resultData["available"] = quantity;
        resultData["availableScore"] = resultData.totalScore / resultData.max * quantity;

        var menuData = {};
        menuData["recipe"] = resultData;
        menus.push(menuData);
    }
    rule["menus"] = menus;

    var selfSelectData = [];
    for (var i = 0; i < 9; i++) {
        var oneMenu = {};
        oneMenu["group"] = Math.floor(i / 3);
        oneMenu["chef"] = {};
        oneMenu["recipe"] = {};
        oneMenu["recipe"]["data"] = {};
        oneMenu["equip"] = {};
        selfSelectData.push(oneMenu);
    }

    if (rule.hasOwnProperty("MaterialsEffect") || rule.hasOwnProperty("ChefsTagsEffect") || rule.hasOwnProperty("RecipesTagsEffect")
        || rule.hasOwnProperty("RecipesSkillsEffect") || rule.hasOwnProperty("RecipesEffect")) {
        rule["hasRuleAddition"] = true;
    } else {
        rule["hasRuleAddition"] = false;
    }

    if (rule.Title == "正常营业") {
        rule["showTime"] = true;
        rule["showEff"] = true;
        $('#select-cal-order option[value="分数"]').siblings().removeAttr('disabled');
    } else {
        rule["showTime"] = false;
        rule["showEff"] = false;
        $('#select-cal-order').val("分数");
        $('#select-cal-order option[value="分数"]').siblings().attr("disabled", "disabled");
    }

    sortRecipesResult();

    if (rule.showTime) {
        $('.chk-cal-results-show-total-time').prop("checked", true);
    } else {
        $('.chk-cal-results-show-total-time').prop("checked", false);
    }

    if (rule.showEff) {
        $('.chk-cal-results-show-efficiency').prop("checked", true);
    } else {
        $('.chk-cal-results-show-efficiency').prop("checked", false);
    }

    $("#cal-recipes-results-table").DataTable().clear().rows.add(menus).draw();
    initCalResultsShow("recipes", $('#cal-recipes-results-table').DataTable(), $("#pane-cal-recipes-results"));

    $('#cal-self-select-table').DataTable().clear().rows.add(selfSelectData);
    initCalResultsShow("self-select", $('#cal-self-select-table').DataTable(), $("#pane-cal-self-select"));
    $("#pane-cal-self-select .selected-sum").html("请选择");
    $("#pane-cal-self-select .selected-sum-2").html("");

    if (private) {
        $('#cal-chefs-table').DataTable().clear().rows.add(chefs).draw();
        $('#btn-cal-chefs-select-all').click();

        $('#cal-materials-table').DataTable().clear().rows.add(materials).draw();
        $('#btn-cal-materials-select-all').click();

        $('#cal-equips-table').DataTable().clear().rows.add(equips).draw();
        $('#btn-cal-equips-select-all').click();
    }
}

function initCalCustomOptions(rule, data) {
    var chefsOptions = getChefsOptions(rule.chefs);
    var recipesOptions = getRecipesOptions(rule);
    var equipsOptions = getEquipsOptions(rule.equips, data.skills);

    $('#cal-self-select-table').DataTable().MakeCellsEditable("destroy");

    $('#cal-self-select-table').DataTable().MakeCellsEditable({
        "columns": [2, 3, 5, 15],  // chef name, equip, recipe name, quantity
        "inputTypes": [
            {
                "column": 2,
                "type": "list",
                "search": true,
                "clear": true,
                "options": chefsOptions
            },
            {
                "column": 3,
                "type": "list",
                "search": true,
                "clear": true,
                "options": equipsOptions
            },
            {
                "column": 5,
                "type": "list",
                "search": true,
                "clear": true,
                "options": recipesOptions,
                "optionsp": true
            }
        ],
        "onUpdate": function (table, row, cell, oldValue) {

            var group = row.data().group;

            if ($(cell.node()).hasClass("cal-td-chef-name")) {
                var chefName = cell.data();
                var equipName = "";
                if ($("#chk-cal-use-equip").prop("checked")) {
                    if (chefName) {
                        for (var j in rule.chefs) {
                            if (rule.chefs[j].name == chefName) {
                                equipName = rule.chefs[j].equipName;
                                break;
                            }
                        }
                    }
                }
                for (var k = 0; k < 3; k++) {
                    table.data()[3 * group + k].chef.name = chefName;
                    if ($("#chk-cal-use-equip").prop("checked")) {
                        table.data()[3 * group + k].equip.name = equipName;
                    }
                }
            } else if ($(cell.node()).hasClass("cal-td-equip-name")) {
                for (var k = 0; k < 3; k++) {
                    table.data()[3 * group + k].equip.name = cell.data();
                }
            } else if ($(cell.node()).hasClass("cal-td-recipe-name")) {
                if (cell.data() != oldValue) {
                    row.data().recipe.quantity = 0;
                    row.data().recipe.setQuantity = true;
                }
            }

            calCustomResults(rule, data);

            $(table.body()).removeClass("processing");
        },
        "waitUpdate": true
    });
}

function calCustomResults(rule, data) {

    var table = $('#cal-self-select-table').DataTable();
    var custom = table.data().toArray();

    var partialChefIds = [];

    for (var i in custom) {

        var chefData = {};
        var chefName = custom[i].chef.name || "";
        if (chefName) {
            chefData["name"] = chefName;
            for (var j in rule.chefs) {
                if (rule.chefs[j].name == chefName) {
                    chefData = JSON.parse(JSON.stringify(rule.chefs[j]));
                    break;
                }
            }
        }

        var equipInfo = getEquipInfo(custom[i].equip.name, rule.equips);
        if (equipInfo) {
            custom[i].equip = equipInfo;
        } else {
            custom[i].equip = {};
        }

        if (chefData.chefId && partialChefIds.indexOf(chefData.chefId) < 0 && rule.calPartialChefIds.indexOf(chefData.chefId) >= 0) {
            partialChefIds.push(chefData.chefId);
        }
        custom[i].chef = chefData;

        var recipeData = {};
        recipeData["data"] = {};
        var recipeName = custom[i].recipe.data.name ? custom[i].recipe.data.name : "";
        if (recipeName) {
            recipeData["data"]["name"] = recipeName;
            recipeData["disp"] = recipeName;
            for (var j in rule.menus) {
                if (rule.menus[j].recipe.data.name == recipeName) {
                    recipeData["data"] = JSON.parse(JSON.stringify(rule.menus[j].recipe.data));

                    var quantity = custom[i].recipe.quantity;
                    if (!quantity) {
                        quantity = 0;
                    }
                    var maxQuantity = rule.menus[j].recipe.max;
                    if (quantity > maxQuantity) {
                        quantity = maxQuantity;
                    }
                    recipeData["quantity"] = quantity;
                    recipeData["max"] = maxQuantity;
                    recipeData["setQuantity"] = custom[i].recipe.setQuantity;
                    break;
                }
            }
        }
        custom[i].recipe = recipeData;
    }

    var materialsResult = checkMaterials2(custom, rule.materials);

    for (var i in custom) {
        if (custom[i].recipe.data.recipeId && custom[i].recipe.setQuantity) {
            var available = getRecipeQuantity(custom[i].recipe.data, materialsResult.materials, rule);
            var maxAvailable = custom[i].recipe.max - custom[i].recipe.quantity;
            if (available > maxAvailable) {
                available = maxAvailable;
            }
            custom[i].recipe["quantity"] = available;
            custom[i].recipe["setQuantity"] = false;
        }
    }

    var partialUltimateData = getPartialUltimateData(data.chefs, data.partialSkill, true, partialChefIds);

    var price = 0;
    var bonus = 0;
    var score = 0;
    var time = 0;
    var timeAddition = 0;
    var ultimate1 = "";
    var ultimate2 = "";
    var ultimate3 = "";
    var ultimate4 = "";
    var ultimate5 = "";

    for (var i in custom) {
        if (custom[i].chef.chefId) {
            setDataForChef(custom[i].chef, custom[i].equip, true, rule.calGlobalUltimateData, partialUltimateData, partialUltimateData, rule.calSelfUltimateData, false);

            if (i % 3 == 0) {
                if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
                    timeAddition += getTimeAddition(custom[i].chef.specialSkillEffect);
                }
                if (!rule || !rule.hasOwnProperty("DisableEquipSkillEffect") || rule.DisableEquipSkillEffect == false) {
                    if (custom[i].equip && custom[i].equip.effect) {
                        var equipEffect = updateEquipmentEffect(custom[i].equip.effect, custom[i].chef.selfUltimateEffect);
                        timeAddition += getTimeAddition(equipEffect);
                    }
                }
            }
        }

        if (custom[i].recipe.data.recipeId) {
            custom[i].recipe["totalTime"] = custom[i].recipe.data.time * custom[i].recipe.quantity;
            custom[i].recipe["totalTimeDisp"] = secondsToTime(custom[i].recipe.totalTime);
            time += custom[i].recipe.totalTime;
        }

        if (custom[i].recipe.data.recipeId && custom[i].chef.chefId) {
            var resultData = getRecipeResult(custom[i].chef, custom[i].equip, custom[i].recipe.data, custom[i].recipe.quantity, custom[i].recipe.max, rule.materials, rule, rule.decorationEffect);
            if (resultData.rankVal > 0) {
                custom[i].recipe = resultData;

                price += resultData.totalPrice;
                bonus += resultData.totalBonusScore;
                score += resultData.totalScore;

                if (resultData.data.ultimateAdditionDisp && resultData.quantity > 0) {
                    if (resultData.data.rarity == 1) {
                        ultimate1 = resultData.data.ultimateAdditionDisp;
                    } else if (resultData.data.rarity == 2) {
                        ultimate2 = resultData.data.ultimateAdditionDisp;
                    } else if (resultData.data.rarity == 3) {
                        ultimate3 = resultData.data.ultimateAdditionDisp;
                    } else if (resultData.data.rarity == 4) {
                        ultimate4 = resultData.data.ultimateAdditionDisp;
                    } else if (resultData.data.rarity == 5) {
                        ultimate5 = resultData.data.ultimateAdditionDisp;
                    }
                }
            } else {
                var skillDiff = getSkillDiff(custom[i].chef, custom[i].recipe.data, 1);
                custom[i].recipe["disp"] += "<br><small>" + skillDiff.disp + "</small>";
            }
        }
    }

    materialsResult = checkMaterials2(custom, rule.materials);
    for (var i in custom) {
        if (custom[i].recipe.data.recipeId) {
            var available = getRecipeQuantity(custom[i].recipe.data, materialsResult.materials, rule);
            var maxAvailable = custom[i].recipe.max - custom[i].recipe.quantity;
            if (available > maxAvailable) {
                available = maxAvailable;
            }
            custom[i].recipe["available"] = available;
        }
    }

    table.clear().rows.add(custom).draw();

    $("#pane-cal-self-select .selected-sum").html("").append("原售价：" + price);
    if (rule.hasRuleAddition) {
        $("#pane-cal-self-select .selected-sum").append(" 规则分：" + bonus);
    }
    $("#pane-cal-self-select .selected-sum").append(" 总得分：" + score);
    if (rule.showTime) {

        for (var i in partialUltimateData) {
            timeAddition += getTimeAddition(partialUltimateData[i].effect);
        }

        if (+timeAddition.toFixed(2) != 0) {
            $("#pane-cal-self-select .selected-sum").append(" 原时间：" + (secondsToTime(time) || 0));
        }
        var finalTime = Math.ceil(+(time * (1 + timeAddition / 100)).toFixed(2));
        $("#pane-cal-self-select .selected-sum").append(" 总时间：" + (secondsToTime(finalTime) || 0));

        var finalEff = 0;
        if (finalTime > 0) {
            finalEff = Math.floor(score * 3600 / finalTime);
        }
        $("#pane-cal-self-select .selected-sum").append(" 总效率：" + finalEff + "金币/小时");
    }

    if (materialsResult.message) {
        $("#pane-cal-self-select .selected-sum").append(" (" + materialsResult.message + ")");
    }

    $("#pane-cal-self-select .selected-sum-2").html("当前菜谱使用菜谱售价修炼加成：");
    if (ultimate1 || ultimate2 || ultimate3 || ultimate4 || ultimate5) {
        if (ultimate1) {
            $("#pane-cal-self-select .selected-sum-2").append("1星" + ultimate1 + " ");
        }
        if (ultimate2) {
            $("#pane-cal-self-select .selected-sum-2").append("2星" + ultimate2 + " ");
        }
        if (ultimate3) {
            $("#pane-cal-self-select .selected-sum-2").append("3星" + ultimate3 + " ");
        }
        if (ultimate4) {
            $("#pane-cal-self-select .selected-sum-2").append("4星" + ultimate4 + " ");
        }
        if (ultimate5) {
            $("#pane-cal-self-select .selected-sum-2").append("5星" + ultimate5 + " ");
        }
    } else {
        $("#pane-cal-self-select .selected-sum-2").append("无");
    }

    rule["rest"] = materialsResult.materials;
    calRecipesResults(rule);
    initCalCustomOptions(rule, data);
}

function getRecipesOptions(rule) {
    var result = {};
    var custom = $('#cal-self-select-table').DataTable().data().toArray();
    var order = $("#select-cal-order").val();
    var chkGot = $('#chk-cal-got').prop("checked");
    var chkNoOrigin = $('#chk-cal-no-origin').prop("checked");
    for (var i in custom) {
        if (i % 3 != 0) {
            result[i] = result[i - 1];
        } else {
            var options = [];
            for (var j in rule.menus) {

                if (chkGot && !rule.menus[j].recipe.data.got) {
                    continue;
                }

                if (!chkNoOrigin && !rule.menus[j].recipe.data.origin) {
                    continue;
                }

                var option = {};
                option["display"] = rule.menus[j].recipe.data.name;
                option["value"] = rule.menus[j].recipe.data.name;

                var maxScore = rule.menus[j].recipe.totalScore;
                var efficiency = rule.menus[j].recipe.efficiency;
                var sDiff = "";
                if (custom[i].chef.chefId) {
                    var resultData = getRecipeResult(custom[i].chef, custom[i].equip, rule.menus[j].recipe.data, rule.menus[j].recipe.max, rule.menus[j].recipe.max, rule.materials, rule, rule.decorationEffect);
                    if (resultData.rankVal > 0) {
                        maxScore = resultData.totalScore;
                        efficiency = resultData.efficiency;
                    } else {
                        var skillDiff = getSkillDiff(custom[i].chef, rule.menus[j].recipe.data, 1);
                        sDiff = " " + skillDiff.disp;
                    }
                }

                var aLess = false;
                if (rule.hasOwnProperty("MaterialsNum")) {
                    var avaScore = maxScore / rule.menus[j].recipe.max * rule.menus[j].recipe.available;
                    option["subtext"] = rule.menus[j].recipe.available + "/" + rule.menus[j].recipe.max + " " + avaScore + "/" + maxScore;
                    option["order"] = avaScore;
                    if (rule.menus[j].recipe.available < rule.menus[j].recipe.max) {
                        aLess = true;
                    }
                } else {
                    if (order == "分数") {
                        option["subtext"] = maxScore;
                        option["order"] = maxScore;
                    } else if (order == "时间") {
                        option["subtext"] = rule.menus[j].recipe.data.totalTimeDisp;
                        option["order"] = rule.menus[j].recipe.data.totalTime;
                    } else if (order == "效率") {
                        option["subtext"] = efficiency;
                        option["order"] = efficiency;
                    }
                }

                option["class"] = "";
                if (sDiff != "") {
                    option["subtext"] += " " + sDiff;
                    option["class"] += "option-warning";
                }
                if (aLess) {
                    option["class"] += " option-sub-warning";
                }

                options.push(option);
            }

            options.sort(function (a, b) {
                return b.order - a.order
            });

            var option = {};
            option["display"] = "无菜谱";
            option["value"] = "";
            option["class"] = "hidden"
            options.unshift(option);

            result[i] = options;
        }
    }

    return result;
}

function calRecipesResults(rule) {
    var table = $('#cal-recipes-results-table').DataTable();
    var menus = table.rows({ order: 'applied' }).data().toArray();
    var selects = table.rows({ selected: true }).data().toArray();
    var custom = $('#cal-self-select-table').DataTable().data().toArray();

    for (var j in menus) {
        var available = getRecipeQuantity(menus[j].recipe.data, rule.rest, rule);

        for (var i in custom) {
            if (menus[j].recipe.data.recipeId == custom[i].recipe.data.recipeId) {
                var maxAvailable = menus[j].recipe.max - custom[i].recipe.quantity;
                if (available > maxAvailable) {
                    available = maxAvailable;
                }
            }
        }

        menus[j].recipe.available = available;
        menus[j].recipe.availableScore = menus[j].recipe.totalScore / menus[j].recipe.max * available;
    }

    table.clear().rows.add(menus);
    if ($("#pane-cal-recipes-results .chk-cal-results-lock-order").prop("checked")) {
        table.order([]);
    }

    table.rows(function (idx, data, node) {
        for (var i in selects) {
            if (data.recipe.data.recipeId == selects[i].recipe.data.recipeId) {
                return true;
            }
        }
        return false;
    }).select();

    table.draw();
}

function sortRecipesResult() {
    var orderColumn = 30;
    var value = $('#select-cal-order').val();
    if (value == "分数") {
        orderColumn = 30;      // totalScore
    } else if (value == "时间") {
        orderColumn = 31;     // totalTime
    } else if (value == "效率") {
        orderColumn = 32;     // efficiency
    }

    var exist = false;

    var table = $('#cal-recipes-results-table').DataTable();
    var order = table.order();
    for (var i in order) {
        if (order[i][0] == orderColumn && order[i][1] == "desc") {
            exist = true;
            break;
        }
    }

    if (!exist) {
        table.order([orderColumn, 'desc']).draw();
    }
}

function checkMaterials2(custom, materials) {
    var materialsData = JSON.parse(JSON.stringify(materials));

    for (var i in custom) {
        var recipe = custom[i].recipe;
        if (recipe.data.recipeId) {
            for (var m in recipe.data.materials) {
                for (var n in materialsData) {
                    if (recipe.data.materials[m].material == materialsData[n].materialId) {
                        if (Number.isInteger(parseInt(materialsData[n].quantity))) {
                            materialsData[n].quantity -= recipe.data.materials[m].quantity * recipe.quantity;
                        }
                    }
                }
            }
        }
    }

    var message = "";
    for (var n in materialsData) {
        if (materialsData[n].quantity < 0) {
            message += materialsData[n].name + materialsData[n].quantity;
        }
    }

    return { "materials": materialsData, "message": message };
}

function initCalChefsTable(data) {
    var calChefsColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox nodetails all',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "name",
            "width": "81px",
            "className": "all"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "className": "rarity",
            "width": "50px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "stirfryVal",
                "display": "stirfryDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "boilVal",
                "display": "boilDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "knifeVal",
                "display": "knifeDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "fryVal",
                "display": "fryDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "bakeVal",
                "display": "bakeDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "steamVal",
                "display": "steamDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "specialSkillDisp"
        },
        {
            "data": "gender",
            "width": "30px"
        },
        {
            "data": "origin"
        },
        {
            "data": "tagsDisp",
            "defaultContent": ""
        },
        {
            "data": "addition",
            "className": "cal-td-input-addition nodetails all",
            "orderSequence": ["desc", "asc"],
            "width": "38px"
        },
        {
            "data": "equipName",
            "className": "cal-td-select-equip nodetails all",
            "width": "101px"
        }
    ];

    var calChefsTable = $('#cal-chefs-table').DataTable({
        data: [],
        columns: calChefsColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "共 _MAX_ 个厨师",
            infoEmpty: "没有数据",
            infoFiltered: "",
            select: {
                rows: {
                    _: "选择了 %d 个厨师",
                    0: "选择了 %d 个厨师",
                    1: "选择了 %d 个厨师"
                }
            }
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        autoWidth: false,
        createdRow: function (row, data, index) {
            $(row).addClass('rarity-' + data.rarity);
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i > 4 && i <= 9) {
                                continue;
                            } else if (i == 4) {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'>";
                                for (var j = 4; j <= 9; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            } else {
                                data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                    + "<span class='child-key'>" + columns[i].title + (i == 1 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }
                    return data ? "<div class='child-inner'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-chefs div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="名字 性别"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('cal-chefs-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-chefs .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.gender, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.tagsDisp, value)) {
            return true;
        } else {
            return false;
        }
    });

    var options = getEquipsOptions(data.equips, data.skills);
    calChefsTable.MakeCellsEditable({
        "columns": [14, 15],  // addition, equip
        "inputTypes": [
            {
                "column": 15,   // equip
                "type": "list",
                "search": true,
                "clear": true,
                "options": options
            }
        ]
    });

    $('#chk-cal-chefs-show').on('changed.bs.select', function () {
        initCalChefsShow(calChefsTable);
    });

    $('.chk-cal-chefs-rarity input[type="checkbox"]').click(function () {
        var rarity = $(this).attr("data-rarity");
        if ($(this).prop("checked")) {
            calChefsTable.rows('.rarity-' + rarity).select();
        } else {
            calChefsTable.rows('.rarity-' + rarity).deselect();
        }
    });

    $("#btn-cal-chefs-equip-clear").click(function () {
        calChefsTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            this.cell(rowIdx, '.cal-td-select-equip').data("");
        });
    });

    $('#pane-cal-chefs .search-box input').keyup(function () {
        calChefsTable.draw();
        changeInputStyle(this);
    });

    $('#btn-cal-chefs-select-all').click(function () {
        $('.chk-cal-chefs-rarity input[type="checkbox"]').prop("checked", true);
        calChefsTable.rows().select();
    });

    $('#btn-cal-chefs-deselect-all').click(function () {
        $('.chk-cal-chefs-rarity input[type="checkbox"]').prop("checked", false);
        calChefsTable.rows().deselect();
    });

    initCalChefsShow(calChefsTable);
}

function initCalEquipsTable(data) {
    var calEquipsColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox nodetails all',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "name",
            "width": "80px",
            "className": "all"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "className": "rarity",
            "width": "35px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "skillDisp"
        },
        {
            "data": "origin"
        }
    ];

    var calEquipsTable = $('#cal-equips-table').DataTable({
        data: [],
        columns: calEquipsColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "共 _MAX_ 个厨具",
            infoEmpty: "没有数据",
            infoFiltered: "",
            select: {
                rows: {
                    _: "选择了 %d 个厨具",
                    0: "选择了 %d 个厨具",
                    1: "选择了 %d 个厨具"
                }
            }
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [[4, "desc"]],  //origin
        autoWidth: false,
        createdRow: function (row, data, index) {
            $(row).addClass('rarity-' + data.rarity);
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                + "<span class='child-key'>" + columns[i].title + (i == 1 ? "" : "：") + "</span>"
                                + "<span class='child-value'>"
                                + columns[i].data
                                + "</span>"
                                + "</div>";
                        }
                    }
                    return data ? "<div class='child-inner'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-equips div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="名字 技能 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('cal-equips-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-equips .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.skillDisp, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.origin, value)) {
            return true;
        } else {
            return false;
        }
    });

    $('#chk-cal-equips-show').on('changed.bs.select', function () {
        initCalEquipsShow(calEquipsTable);
    });

    $('.chk-cal-equips-rarity input[type="checkbox"]').click(function () {
        var rarity = $(this).attr("data-rarity");
        if ($(this).prop("checked")) {
            calEquipsTable.rows('.rarity-' + rarity).select();
        } else {
            calEquipsTable.rows('.rarity-' + rarity).deselect();
        }
    });

    $('#pane-cal-equips .search-box input').keyup(function () {
        calEquipsTable.draw();
        changeInputStyle(this);
    });

    $('#btn-cal-equips-select-all').click(function () {
        $('.chk-cal-equips-origin input[type="checkbox"]').prop("checked", true);
        calEquipsTable.rows().select();
    });

    $('#btn-cal-equips-deselect-all').click(function () {
        $('.chk-cal-equips-origin input[type="checkbox"]').prop("checked", false);
        calEquipsTable.rows().deselect();
    });

    $('#btn-cal-equips-export').click(function () {
        var selectedData = $('#cal-equips-table').DataTable().rows({ selected: true }).data().toArray();
        var exportData = {};
        exportData["calEquips"] = [];
        for (var i in selectedData) {
            exportData.calEquips.push(selectedData[i].equipId);
        }
        $("#input-export-import").val(JSON.stringify(exportData));
    });

    initCalEquipsShow(calEquipsTable);
}

function initCalMaterialsTable(data) {
    var calMaterialsColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox nodetails all',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "materialId",
            "width": "1px"
        },
        {
            "data": "name",
            "className": "all"
        },
        {
            "data": "origin"
        },
        {
            "data": "quantity",
            "className": "cal-td-input-quantity nodetails all",
            "orderSequence": ["desc", "asc"],
            "width": "50px"
        },
        {
            "data": "addition",
            "className": "cal-td-input-addition nodetails all",
            "orderSequence": ["desc", "asc"],
            "width": "50px"
        }
    ];

    var calMaterialsTable = $('#cal-materials-table').DataTable({
        data: [],
        columns: calMaterialsColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 个",
            zeroRecords: "没有找到",
            info: "共 _MAX_ 个食材",
            infoEmpty: "没有数据",
            infoFiltered: "",
            select: {
                rows: {
                    _: "选择了 %d 个食材",
                    0: "选择了 %d 个食材",
                    1: "选择了 %d 个食材"
                }
            }
        },
        pagingType: "numbers",
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [[3, "desc"]],  //origin
        autoWidth: false,
        createdRow: function (row, data, index) {
            $(row).addClass('origin-' + data.originVal);
        },
        responsive: {
            details: {
                type: 'column',
                target: 'td:not(.nodetails)',
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            data += "<div class='col-lg-3 col-sm-6 col-xs-12'>"
                                + "<span class='child-key'>" + columns[i].title + (i == 1 ? "" : "：") + "</span>"
                                + "<span class='child-value'>"
                                + columns[i].data
                                + "</span>"
                                + "</div>";
                        }
                    }
                    return data ? "<div class='child-inner'>" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-materials div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="名字 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('cal-materials-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-materials .search-box input").val());
        if (commaSeparatedMatch(rowData.name, value)) {
            return true;
        } else if (commaSeparatedMatch(rowData.origin, value)) {
            return true;
        } else {
            return false;
        }
    });

    calMaterialsTable.MakeCellsEditable({
        "columns": [4, 5]  // addition, quantity
    });

    $('#chk-cal-materials-show').on('changed.bs.select', function () {
        initCalMaterialsShow(calMaterialsTable);
    });

    $('.chk-cal-materials-origin input[type="checkbox"]').click(function () {
        var origin = $(this).attr("data-origin");
        if ($(this).prop("checked")) {
            calMaterialsTable.rows('.origin-' + origin).select();
        } else {
            calMaterialsTable.rows('.origin-' + origin).deselect();
        }
    });

    $('#pane-cal-materials .search-box input').keyup(function () {
        calMaterialsTable.draw();
        changeInputStyle(this);
    });

    $('#btn-cal-materials-select-all').click(function () {
        $('.chk-cal-materials-origin input[type="checkbox"]').prop("checked", true);
        calMaterialsTable.rows().select();
    });

    $('#btn-cal-materials-deselect-all').click(function () {
        $('.chk-cal-materials-origin input[type="checkbox"]').prop("checked", false);
        calMaterialsTable.rows().deselect();
    });

    initCalMaterialsShow(calMaterialsTable);
}

function initCalResultsTable(data) {

    $("#pane-cal-self-select").html($("#pane-cal-results-common").html());
    $("#pane-cal-self-select .cal-results-table").prop("id", "cal-self-select-table");
    initCalResultTableCommon("self-select", $("#pane-cal-self-select"));

    $("#pane-cal-recipes-results").html($("#pane-cal-results-common").html());
    $("#pane-cal-recipes-results .cal-results-table").prop("id", "cal-recipes-results-table");
    initCalResultTableCommon("recipes", $("#pane-cal-recipes-results"));

    if (private) {
        $("#cal-optimal-results-place").html($("#pane-cal-results-common").html());
        $("#cal-optimal-results-place .cal-results-table").prop("id", "cal-optimal-results-table");
        initCalResultTableCommon("optimal", $("#pane-cal-optimal-results"));

        var calOptimalWorker;

        $('.btn-cal-results-cal').click(function () {

            if (!currentRule) {
                alert("请加载规则");
                return;
            }

            var panel = $("#pane-cal-optimal-results");

            if (typeof (calOptimalWorker) != "undefined") {
                calOptimalWorker.terminate();
                calOptimalWorker = undefined;
            }

            if ($(this).hasClass("stop")) {
                panel.find(".cal-results-progress").addClass("hidden");
                panel.find(".btn-cal-results-cal.start").prop("disabled", false);
                panel.find(".btn-cal-results-cal.stop").prop("disabled", true);
                return;
            }

            panel.find(".btn-cal-results-cal.start").prop("disabled", true);
            panel.find(".btn-cal-results-cal.stop").prop("disabled", false);
            panel.find(".cal-results-wrapper").addClass("hidden");
            panel.find(".cal-results-progress .progress-bar").css("width", "0%");
            panel.find(".cal-results-progress .progress-bar span").text("预处理中");
            panel.find(".cal-results-progress").removeClass("hidden");

            calOptimalWorker = new Worker("others/js/cal.js?v=" + (new Date()).getTime());

            calOptimalWorker.onmessage = function (event) {
                if (event.data.progress) {
                    panel.find(".cal-results-progress .progress-bar").css("width", event.data.progress.value + "%");
                    panel.find(".cal-results-progress .progress-bar span").text(event.data.progress.display);
                } else if (event.data.menu) {
                    if (event.data.message) {
                        panel.find(".selected-sum").html(event.data.message);
                    } else {
                        panel.find(".selected-sum").html("");
                    }
                    console.log(event.data.menu);
                    $("#cal-optimal-results-table").DataTable().clear().rows.add(event.data.menu).draw();
                    panel.find(".cal-results-wrapper").removeClass("hidden");
                } else if (event.data.done) {
                    panel.find(".btn-cal-results-cal.stop").prop("disabled", true);
                    panel.find(".btn-cal-results-cal.start").prop("disabled", false);
                    panel.find(".cal-results-progress").addClass("hidden");
                } else if (event.data.error) {
                    alert(event.data.error);
                }
            };

            var calCustomData = $('#cal-self-select-table').DataTable().data().toArray();
            var calRecipesData = $('#cal-recipes-results-table').DataTable().rows({ selected: true }).data().toArray();
            var calChefsData = $('#cal-chefs-table').DataTable().rows({ selected: true }).data().toArray();
            var calEquipsData = $('#cal-equips-table').DataTable().rows({ selected: true }).data().toArray();
            var calMaterialsData = $('#cal-materials-table').DataTable().rows({ selected: true }).data().toArray();
            var noEquips = $('#chk-cal-results-no-equips').prop("checked");
            var addEquips = $('#chk-cal-results-add-equips').prop("checked");
            var changeEquips = $('#chk-cal-results-change-equips').prop("checked");
            var fixEquips = $('#chk-cal-results-fix-equips').prop("checked");
            var minScore = Number($('#input-cal-min-score').val());
            var thread = Number($('#input-cal-thread').val());
            var mode = $('#select-cal-type').val();

            calOptimalWorker.postMessage({
                "mode": mode,
                "rule": currentRule,
                "custom": calCustomData,
                "recipes": calRecipesData,
                "chefs": calChefsData,
                "equips": calEquipsData,
                "materials": calMaterialsData,
                "odata": data,
                "noEquips": noEquips,
                "addEquips": addEquips,
                "changeEquips": changeEquips,
                "fixEquips": fixEquips,
                "minScore": minScore,
                "thread": thread
            });
        });

        $('#btn-cal-set-custom').click(function () {
            if (!currentRule) {
                alert("请加载规则");
                return;
            }

            var result = JSON.parse(JSON.stringify($("#cal-optimal-results-table").DataTable().data()));
            if (result.length == 9) {
                $('#cal-self-select-table').DataTable().clear().rows.add(result);
                calCustomResults(currentRule, data);
            }
        });
    }

    $("#pane-cal-results-common").remove();
}

function initCalResultTableCommon(mode, panel) {

    var calResultsColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "group",
            "defaultContent": ""
        },
        {
            "data": {
                "_": "chef.name",
                "display": "chef.disp"
            },
            "className": "cal-td-chef-name",
            "defaultContent": ""
        },
        {
            "data": {
                "_": "equip.name",
                "display": "equip.disp"
            },
            "className": "cal-td-equip-name",
            "defaultContent": ""
        },
        {
            "data": "recipe.data.galleryId",
            "defaultContent": "",
            "width": "1px"
        },
        {
            "data": {
                "_": "recipe.data.name",
                "display": "recipe.disp"
            },
            "className": "cal-td-recipe-name",
            "defaultContent": "",
            "width": "86px"
        },
        {
            "data": {
                "_": "recipe.data.rarity",
                "display": "recipe.data.rarityDisp"
            },
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "className": "rarity",
            "width": "50px"
        },
        {
            "data": "recipe.data.stirfry",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "20px"
        },
        {
            "data": "recipe.data.boil",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "20px"
        },
        {
            "data": "recipe.data.knife",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "20px"
        },
        {
            "data": "recipe.data.fry",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "20px"
        },
        {
            "data": "recipe.data.bake",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "20px"
        },
        {
            "data": "recipe.data.steam",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "20px"
        },
        {
            "data": {
                "_": "recipe.data.materialsVal",
                "display": "recipe.data.materialsDisp"
            },
            "defaultContent": "",
            "width": "230px"
        },
        {
            "data": "recipe.data.origin",
            "defaultContent": "",
            "width": "115px"
        },
        {
            "data": "recipe.quantity",
            "className": "cal-td-quantity",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "recipe.available",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "recipe.availableScore",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "80px"
        },
        {
            "data": "recipe.max",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": {
                "_": "recipe.data.price",
                "display": "recipe.data.priceDisp"
            },
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "32px"
        },
        {
            "data": {
                "_": "recipe.rankVal",
                "display": "recipe.rankDisp"
            },
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "recipe.rankAdditionDisp",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.chefSkillAdditionDisp",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.equipSkillAdditionDisp",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.bonusAdditionDisp",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.data.ultimateAdditionDisp",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.decorationAdditionDisp",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.totalPrice",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.totalRealPrice",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.totalBonusScore",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.totalScore",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "recipe.totalTime",
                "display": "recipe.totalTimeDisp"
            },
            "defaultContent": ""
        },
        {
            "data": "recipe.efficiency",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        }
    ];

    var paging = true;
    var info = true;
    var ordering = true;
    if (mode == "optimal" || mode == "self-select") {
        paging = false;
        info = false;
        ordering = false;
    }

    var table = panel.find('.cal-results-table').DataTable({
        data: [],
        columns: calResultsColumns,
        language: {
            search: "查找:",
            lengthMenu: "一页显示 _MENU_ 条",
            zeroRecords: "没有找到",
            info: "共 _TOTAL_ 条",
            infoEmpty: "没有数据",
            infoFiltered: "(从 _MAX_ 条中过滤)",
            select: {
                rows: {
                    _: "选择了 %d 个菜谱",
                    0: "选择了 %d 个菜谱",
                    1: "选择了 %d 个菜谱"
                }
            }
        },
        paging: paging,
        pagingType: "numbers",
        lengthMenu: [[5, 10, 20, 50, 100, -1], [5, 10, 20, 50, 100, "所有"]],
        pageLength: 20,
        dom: "<'row'<'col-sm-12'<'selected-sum'>>>" +
            "<'row'<'col-sm-12'<'selected-sum-2'>>>" +
            "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        autoWidth: false,
        info: info,
        ordering: ordering,
        order: [],
        rowsGroup: [1, 2, 3]   // from group, chef, equip
    });

    if (mode == "recipes") {
        panel.find("div.search-box").html('<label>查找:<input type="search" class="form-control input-sm monitor-none" placeholder="菜名 材料"></label>');
        panel.find('.search-box input').keyup(function () {
            table.draw();
            changeInputStyle(this);
        });

        $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
            if (settings.nTable != document.getElementById('cal-recipes-results-table')) {
                return true;
            }

            var value = $.trim($("#pane-cal-recipes-results .search-box input").val());
            if (commaSeparatedMatch(rowData.recipe.data.name, value)) {
                return true;
            } else if (commaSeparatedMatch(rowData.recipe.data.materialsVal, value)) {
                return true;
            } else if (commaSeparatedMatch(rowData.recipe.data.tagsDisp, value)) {
                return true;
            } else {
                return false;
            }
        });

        $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
            if (settings.nTable != document.getElementById('cal-recipes-results-table')) {
                return true;
            }

            var check = $('#chk-cal-got').prop("checked");
            if (!check || check && rowData.recipe.data.got) {
                return true;
            } else {
                return false;
            }
        });

        $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
            if (settings.nTable != document.getElementById('cal-recipes-results-table')) {
                return true;
            }

            var check = $('#chk-cal-no-origin').prop("checked");

            if (check || !check && rowData.recipe.data.origin) {
                return true;
            } else {
                return false;
            }
        });

        panel.find('.btn-cal-recipes-select-all').off("click").click(function () {
            table.rows().select();
        });

        panel.find('.btn-cal-recipes-deselect-all').off("click").click(function () {
            table.rows().deselect();
        });
    }

    panel.find('.chk-cal-results-show').off("click").click(function () {
        initCalResultsShow(mode, table, panel);
    });

    initCalResultsShow(mode, table, panel);

    return table;
}

function generateData(json, json2, person) {

    var retData = {};

    if (json2) {
        for (var i in json2.equips) {
            json2.equips[i]["hide"] = true;
        }
        for (var i in json2.decorations) {
            json2.decorations[i]["hide"] = true;
        }
        for (var i in json2.recipes) {
            json2.recipes[i]["hide"] = true;
        }
        for (var i in json2.chefs) {
            json2.chefs[i]["hide"] = true;
        }
        json.guests = json.guests.concat(json2.guests);
        json.equips = json.equips.concat(json2.equips);
        json.decorations = json.decorations.concat(json2.decorations);
        json.quests = json.quests.concat(json2.quests);
        json.recipes = json.recipes.concat(json2.recipes);
        json.chefs = json.chefs.concat(json2.chefs);
        json.skills = json.skills.concat(json2.skills);
        json.rules = json.rules.concat(json2.rules);
        json.activities = json.activities.concat(json2.activities);

        retData["ranks"] = json2.ranks;
    }

    retData["maps"] = json.maps;

    retData["activities"] = json.activities;

    retData["guests"] = json.guests;

    retData["history"] = json.history;

    retData["skills"] = json.skills;

    var partialSkill = [];
    for (var i in json.skills) {
        var isPartial = false;
        for (var j in json.skills[i].effect) {
            if (json.skills[i].effect[j].condition == "Partial") {
                isPartial = true;
                break;
            }
        }
        if (isPartial) {
            partialSkill.push(json.skills[i]);
        }
    }
    retData["partialSkill"] = partialSkill;

    retData["rules"] = json.rules;

    retData["decorationEffect"] = 0;
    if (person && person.decorationEffect) {
        retData.decorationEffect = person.decorationEffect;
    }

    json.materials.sort(function (a, b) {
        return a.origin.localeCompare(b.origin);
    });

    var materialsData = [];
    for (var i in json.materials) {
        var materialData = json.materials[i];
        materialData["originVal"] = getOriginVal(json.materials[i].origin);
        materialData["addition"] = "";
        materialData["quantity"] = "";
        materialsData.push(materialData);
    }
    retData["materials"] = materialsData;

    var equipsData = [];
    for (var i in json.equips) {

        if (!json.equips[i].name) {
            continue;
        }

        var equip = json.equips[i];
        equip["rarityDisp"] = getRarityDisp(json.equips[i].rarity);
        var skillInfo = getSkillInfo(json.skills, json.equips[i].skill);
        equip["skillDisp"] = skillInfo.skillDisp;
        equip["skillSort"] = 0;
        equip["effect"] = skillInfo.skillEffect;

        if (json.equips[i].hide) {
            equip["icon"] = "<div class='icon-equip2 equip_" + json.equips[i].equipId + "'></div>";
        } else {
            equip["icon"] = "<div class='icon-equip equip_" + json.equips[i].equipId + "'></div>";
        }

        equipsData.push(equip);
    }
    retData["equips"] = equipsData;

    var suitsData = [];
    var decorationsData = [];
    for (var i in json.decorations) {
        var decoration = json.decorations[i];
        decoration.tipMin = decoration.tipMin || "-";
        decoration.tipMax = decoration.tipMax || "-";
        decoration["tipTimeDisp"] = secondsToTime(decoration.tipTime) || "-";
        if (decoration.tipTime) {
            decoration["minEff"] = +(decoration.tipMin * 3600 * 24 / decoration.tipTime).toFixed(1);
            decoration["maxEff"] = +(decoration.tipMax * 3600 * 24 / decoration.tipTime).toFixed(1);
            decoration["avgEff"] = +((decoration.tipMin + decoration.tipMax) / 2 * 3600 * 24 / decoration.tipTime).toFixed(1);
        }

        decoration["goldDisp"] = getPercentDisp(+(decoration.gold * 100).toFixed(2)) || "-";
        decoration["suitDisp"] = decoration.suit || "-";
        decoration["suitGoldDisp"] = getPercentDisp(+(decoration.suitGold * 100).toFixed(2)) || "-";

        if (json.decorations[i].hide) {
            decoration.icon = "<div class='icon-decoration2 decoration_" + decoration.icon + "'></div>";
        } else {
            decoration.icon = "<div class='icon-decoration decoration_" + decoration.icon + "'></div>";
        }

        decorationsData.push(decoration);

        if (decoration.suit) {
            var exist = false;
            for (var j in suitsData) {
                if (suitsData[j].name == decoration.suit) {
                    suitsData[j].decorations.push(decoration.id);
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                var suitData = {};
                suitData["name"] = decoration.suit;
                suitData["gold"] = decoration.suitGold;
                suitData["decorations"] = [];
                suitData.decorations.push(decoration.id);
                suitsData.push(suitData);
            }
        }
    }
    retData["decorations"] = decorationsData;
    retData["suits"] = suitsData;

    var questsData = [];
    for (var i in json.quests) {

        if (!json.quests[i].goal) {
            continue;
        }

        var questData = json.quests[i];

        questData["questIdDisp"] = json.quests[i].questIdDisp ? json.quests[i].questIdDisp : json.quests[i].questId;

        var rewardsDisp = "";
        var rewardsVal = "";
        for (var j in json.quests[i].rewards) {
            rewardsDisp += json.quests[i].rewards[j].name;
            if (json.quests[i].rewards[j].quantity) {
                rewardsDisp += "*" + json.quests[i].rewards[j].quantity;
            }
            rewardsDisp += " ";
            rewardsVal += json.quests[i].rewards[j].name;
        }
        questData["rewardsVal"] = rewardsVal;
        questData["rewardsDisp"] = rewardsDisp;

        questsData.push(questData);
    }
    retData["quests"] = questsData;

    var showFinal = $("#chk-setting-show-final").prop("checked");

    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var usePerson = $("#chk-chef-apply-ultimate-person").prop("checked");
    var ultimateData = getUltimateData(json.chefs, person, json.skills, useUltimate, usePerson);

    retData["ultimateData"] = ultimateData;

    var chefsData = [];
    for (var i in json.chefs) {

        if (!json.chefs[i].name) {
            continue;
        }

        var chefData = json.chefs[i];

        chefData["addition"] = "";

        chefData["rarityDisp"] = getRarityDisp(json.chefs[i].rarity);

        if (json.chefs[i].hide) {
            chefData["icon"] = "<div class='icon-chef2 chef_" + json.chefs[i].chefId + "'></div>";
        } else {
            chefData["icon"] = "<div class='icon-chef chef_" + json.chefs[i].chefId + "'></div>";
        }

        var skillInfo = getSkillInfo(json.skills, json.chefs[i].skill);
        chefData["specialSkillDisp"] = skillInfo.skillDisp;
        chefData["specialSkillEffect"] = skillInfo.skillEffect;

        chefData["tags"] = json.chefs[i].tags || [];
        chefData["tagsDisp"] = "";
        if (json2) {
            for (var j in json2.chefsTags) {
                if (json2.chefsTags[j].chefId == json.chefs[i].chefId) {
                    chefData.tags = json2.chefsTags[j].tags;
                    chefData.tagsDisp = getTagsDisp(json2.chefsTags[j].tags, json2.tags);
                    break;
                }
            }
        }
        chefData["gender"] = getGender(chefData.tags);

        var ultimateGoalDisp = "";
        for (var j in json.chefs[i].ultimateGoal) {
            for (var k in json.quests) {
                if (json.chefs[i].ultimateGoal[j] == json.quests[k].questId) {
                    ultimateGoalDisp += json.quests[k].goal + "<br>";
                    break;
                }
            }
        }
        var ultimateSkillInfo = getSkillInfo(json.skills, json.chefs[i].ultimateSkill);
        var ultimateSkillDisp = ultimateSkillInfo.skillDisp;

        chefData["ultimateGoalDisp"] = ultimateGoalDisp;
        chefData["ultimateSkillDisp"] = ultimateSkillDisp;

        chefData["got"] = "";
        chefData["ultimate"] = "";
        chefData["equip"] = null;
        chefData["equipName"] = "";
        chefData["equipDisp"] = "";

        if (person) {
            for (var j in person.chefs) {
                if (json.chefs[i].chefId == person.chefs[j].id) {
                    if (person.chefs[j].hasOwnProperty("got")) {
                        chefData["got"] = person.chefs[j].got;
                    }
                    if (person.chefs[j].hasOwnProperty("ult")) {
                        chefData["ultimate"] = person.chefs[j].ult;
                    }
                    if (person.chefs[j].hasOwnProperty("equip")) {
                        for (var k in equipsData) {
                            if (person.chefs[j].equip == equipsData[k].equipId) {
                                chefData["equip"] = equipsData[k];
                                chefData["equipName"] = equipsData[k].name;
                                chefData["equipDisp"] = equipsData[k].name + "<br><small>" + equipsData[k].skillDisp + "</small>";
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }

        setDataForChef(chefData, chefData.equip, useEquip, ultimateData.global, ultimateData.partial, null, ultimateData.self, showFinal);

        chefsData.push(chefData);
    }
    retData["chefs"] = chefsData;

    var recipesData = [];
    for (var i in json.recipes) {

        if (!json.recipes[i].name) {
            continue;
        }

        var recipeData = {};
        recipeData = json.recipes[i];

        recipeData["stirfry"] = json.recipes[i].stirfry || "";
        recipeData["boil"] = json.recipes[i].boil || "";
        recipeData["knife"] = json.recipes[i].knife || "";
        recipeData["fry"] = json.recipes[i].fry || "";
        recipeData["bake"] = json.recipes[i].bake || "";
        recipeData["steam"] = json.recipes[i].steam || "";
        recipeData["addition"] = "";

        recipeData["skillDisp"] = getSkillDisp(json.recipes[i]);

        recipeData["timeDisp"] = secondsToTime(json.recipes[i].time);
        recipeData["rarityDisp"] = getRarityDisp(json.recipes[i].rarity);

        if (json.recipes[i].hide) {
            recipeData["icon"] = "<div class='icon-recipe2 recipe_" + json.recipes[i].recipeId + "'></div>";
        } else {
            recipeData["icon"] = "<div class='icon-recipe recipe_" + json.recipes[i].recipeId + "'></div>";
        }

        recipeData["tags"] = json.recipes[i].tags || {};
        recipeData["tagsDisp"] = "";
        recipeData["exTime"] = 0;
        recipeData["exTimeDisp"] = "";

        if (json2) {
            for (var j in json2.recipesTags) {
                if (json2.recipesTags[j].recipeId == json.recipes[i].recipeId) {
                    recipeData.tags = json2.recipesTags[j].tags;
                    recipeData.tagsDisp = getTagsDisp(json2.recipesTags[j].tags, json2.tags);
                    recipeData.exTime = json2.recipesTags[j].experienceTime;
                    recipeData.exTimeDisp = getExTimeDisp(json2.recipesTags[j].experienceTime, json.recipes[i].time);
                    break;
                }
            }
        }

        recipeData["rank"] = "";
        recipeData["ex"] = "";
        recipeData["got"] = "";

        if (person) {
            for (var j in person.recipes) {
                if (json.recipes[i].recipeId == person.recipes[j].id) {
                    if (person.recipes[j].hasOwnProperty("rank")) {
                        recipeData["rank"] = person.recipes[j].rank;
                    }
                    if (person.recipes[j].hasOwnProperty("ex")) {
                        recipeData["ex"] = person.recipes[j].ex;
                    }
                    if (person.recipes[j].hasOwnProperty("got")) {
                        recipeData["got"] = person.recipes[j].got;
                    }
                    break;
                }
            }
        }

        recipeData["oPrice"] = json.recipes[i].price;
        var useEx = ifUseEx(recipeData);
        setDataForRecipe(recipeData, ultimateData.global, useEx, showFinal);

        recipeData["efficiency"] = Math.floor(json.recipes[i].price * 3600 / json.recipes[i].time);

        var materialsInfo = getMaterialsInfo(json.recipes[i], json.materials);
        recipeData["materialsVal"] = materialsInfo.materialsVal;
        recipeData["materialsDisp"] = materialsInfo.materialsDisp;
        recipeData["veg"] = materialsInfo.veg;
        recipeData["meat"] = materialsInfo.meat;
        recipeData["creation"] = materialsInfo.creation;
        recipeData["fish"] = materialsInfo.fish;

        var materialsEff = 0;
        if (json.recipes[i].time > 0) {
            materialsEff = materialsInfo.materialsCount * 3600 / json.recipes[i].time;
        }
        recipeData["allMaterialsEff"] = materialsEff ? Math.floor(materialsEff) : "";

        var combo = "";
        for (var m in json.combos) {
            for (var n in json.combos[m].recipes) {
                if (json.combos[m].recipes[n] == json.recipes[i].recipeId) {
                    for (var o in json.recipes) {
                        if (json.recipes[o].recipeId == json.combos[m].recipeId) {
                            combo = json.recipes[o].name;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        recipeData["comboVal"] = combo;
        recipeData["comboDisp"] = combo ? combo : "-";

        var rankGuestInfo = getRankGuestInfo(json.recipes[i], recipeData.rank);
        recipeData["rankGuestsVal"] = rankGuestInfo.rankGuestsVal;
        recipeData["rankGuestsDisp"] = rankGuestInfo.rankGuestsDisp;

        var rankGiftInfo = getRankGiftInfo(json.recipes[i], recipeData.rank);
        recipeData["rankGiftVal"] = rankGiftInfo.rankGiftVal;
        recipeData["rankGiftDisp"] = rankGiftInfo.rankGiftDisp;

        var guestsVal = "";
        var guestsDisp = "";
        for (var m in json.guests) {
            for (var n in json.guests[m].gifts) {
                if (json.recipes[i].name == json.guests[m].gifts[n].recipe) {
                    guestsVal += " " + json.guests[m].name + " " + json.guests[m].gifts[n].antique + " ";
                    guestsDisp += json.guests[m].name + "-" + json.guests[m].gifts[n].antique + "<br>";
                    break;
                }
            }
        }
        recipeData["guestsVal"] = guestsVal;
        recipeData["guestsDisp"] = guestsDisp ? guestsDisp : "-";

        recipesData.push(recipeData);
    }

    retData["recipes"] = recipesData;

    retData["selectedQuests"] = [];
    retData["questMaterials"] = [];
    retData["allSelectedMaterials"] = [];

    retData["recipeColNum"] = $("#recipe-table-header th").length;
    retData["recipeAddColNum"] = 0;
    retData["recipeAddColNumMax"] = 15;

    retData["chefColNum"] = $("#chef-table-header th").length;
    retData["chefAddColNum"] = 0;
    retData["chefAddColNumMax"] = 15;

    return retData;
}

function updateRecipeChefTable(data) {
    $('.loading').removeClass("hidden");

    setTimeout(function () {
        data = getUpdateData(data);
        updateRecipeTableData(data);
        updateChefTableData(data);
        $('#recipe-table').DataTable().draw(false);
        $('#chef-table').DataTable().draw(false);
        $('.loading').addClass("hidden");
    }, 0);

    $("#btn-chef-recal").closest(".inline-wrapper").addClass("hidden");
    $("#btn-recipe-recal").closest(".inline-wrapper").addClass("hidden");
}

function getUpdateData(data) {

    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    var showFinal = $("#chk-setting-show-final").prop("checked");

    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var usePerson = $("#chk-chef-apply-ultimate-person").prop("checked");
    var ultimateData = getUltimateData(data.chefs, person, data.skills, useUltimate, usePerson);

    data.ultimateData = ultimateData;

    var partialChefIds = $('#chk-chef-partial-ultimate').val();
    var otherPartialUltimateData = getPartialUltimateData(data.chefs, data.partialSkill, useUltimate, partialChefIds);

    for (var i in data.chefs) {
        setDataForChef(data.chefs[i], data.chefs[i].equip, useEquip, ultimateData.global, ultimateData.partial, otherPartialUltimateData, ultimateData.self, showFinal);
    }

    for (var i in data.recipes) {
        var useEx = ifUseEx(data.recipes[i]);
        setDataForRecipe(data.recipes[i], ultimateData.global, useEx, showFinal);
    }

    updateRecipesChefsData(data);
    updateChefsRecipesData(data);

    if (!$('#recipe-table').is(':visible')) {
        $('.main-nav a[data-id="1"]').attr("data-init", "false");
    }
    if (!$('#chef-table').is(':visible')) {
        $('.main-nav a[data-id="2"]').attr("data-init", "false");
    }

    return data;
}

function getQuestsData(quests, type) {
    var retData = [];
    for (var i in quests) {
        if (quests[i].type == type) {
            retData.push(quests[i]);
        }
    }
    return retData;
}

function getMaterialsData(data, map) {
    if (!map) {
        var origin = $('#select-material-origin').val();
        for (var i in data.maps) {
            if (origin == data.maps[i].name) {
                map = data.maps[i];
                break;
            }
        }
    }

    var materials = map.materials;
    var retData = [];
    var isSeason = $("#chk-material-season").prop("checked");
    var addition = Number($("#input-material-addition").val());
    var skill = $("#input-material-skill").val();
    for (var i in materials) {
        var materialData = {};
        materialData["name"] = materials[i].name;
        materialData["skill"] = materials[i].skill;
        materialData["time"] = [];

        for (var j in materials[i].quantity) {
            var min = 0;
            var max = 0;
            if (skill == "" || Number(skill) >= materials[i].skill) {
                min = materials[i].quantity[j][0];
                max = materials[i].quantity[j][1];
                if (isSeason) {
                    min += materials[i].season[j];
                    max += materials[i].season[j];
                }
                if (addition) {
                    min = Math.ceil(+(min * (1 + addition / 100)).toFixed(2));
                    max = Math.ceil(+(max * (1 + addition / 100)).toFixed(2));
                }
            }
            materialData["time"].push([min, max]);
        }

        retData.push(materialData);
    }

    var sumData = {};
    sumData["name"] = "总计";
    sumData["time"] = [];
    for (var i in map.time) {
        var min = 0;
        var max = 0;
        for (var j in retData) {
            min += retData[j]["time"][i][0];
            max += retData[j]["time"][i][1];
        }
        sumData["time"].push([min, max]);
    }

    retData.push(sumData);

    return retData;
}

function getMaterialsInfo(recipe, materials) {
    var materialsInfo = {};
    var materialsDisp = "";
    var materialsVal = "";
    var materialsCount = 0;
    var veg = false;
    var meat = false;
    var creation = false;
    var fish = false;

    for (var k in recipe.materials) {
        for (var m in materials) {
            if (recipe.materials[k].material == materials[m].materialId) {
                materialsDisp += materials[m].name + "*" + recipe.materials[k].quantity + " ";
                materialsVal += materials[m].name + " ";
                materialsCount += recipe.materials[k].quantity;
                recipe.materials[k]["origin"] = materials[m].origin;
                if (materials[m].origin == "菜棚" || materials[m].origin == "菜地" || materials[m].origin == "森林") {
                    veg = true;
                } else if (materials[m].origin == "鸡舍" || materials[m].origin == "猪圈" || materials[m].origin == "牧场") {
                    meat = true;
                } else if (materials[m].origin == "作坊") {
                    creation = true;
                } else if (materials[m].origin == "池塘") {
                    fish = true;
                }
                break;
            }
        }
    }
    materialsInfo["materialsDisp"] = materialsDisp;
    materialsInfo["materialsVal"] = materialsVal;
    materialsInfo["materialsCount"] = materialsCount;
    materialsInfo["veg"] = veg;
    materialsInfo["meat"] = meat;
    materialsInfo["creation"] = creation;
    materialsInfo["fish"] = fish;
    return materialsInfo;
}

function getRarityDisp(rarity) {
    var rarityDisp = "";
    for (var j = 0; j < rarity; j++) {
        rarityDisp += "&#x2605;";
    }
    return rarityDisp;
}

function getGender(tags) {
    if (tags.indexOf(1) >= 0) {
        return "男";
    } else if (tags.indexOf(2) >= 0) {
        return "女";
    } else {
        return "";
    }
}

function getTagsDisp(tagIds, tags) {
    var disp = "";
    for (var j in tagIds) {
        for (var k in tags) {
            if (tagIds[j] == tags[k].Id) {
                disp += tags[k].name + " ";
                break;
            }
        }
    }
    return disp;
}

function getExTimeDisp(exTime, time) {
    var time1 = exTime / 1.5;
    var time2 = exTime / 2;
    var time3 = exTime / 2.5;
    var result = "可-" + Math.ceil(exTime / time) + "-" + secondsToTime(exTime)
        + "<br>优-" + Math.ceil(time1 / time) + "-" + secondsToTime(time1)
        + "<br>特-" + Math.ceil(time2 / time) + "-" + secondsToTime(time2)
        + "<br>神-" + Math.ceil(time3 / time) + "-" + secondsToTime(time3);
    return result;
}

function getOriginVal(origin) {
    var originVal = 0;
    if (origin == "菜棚") {
        originVal = 1;
    } else if (origin == "菜地") {
        originVal = 2;
    } else if (origin == "森林") {
        originVal = 3;
    } else if (origin == "鸡舍") {
        originVal = 4;
    } else if (origin == "猪圈") {
        originVal = 5;
    } else if (origin == "牧场") {
        originVal = 6;
    } else if (origin == "作坊") {
        originVal = 7;
    } else if (origin == "池塘") {
        originVal = 8;
    } else {
        console.log("cannot find origin: " + originVal);
    }
    return originVal;
}

function getRankGuestInfo(recipe, rank) {
    var rankGuestsDisp = "";
    var rankGuestsVal = "";

    var filter = $('#chk-recipe-filter-guest').prop("checked");
    var mark = $("#chk-setting-done-mark").prop("checked");

    for (var i in recipe.guests) {
        var done = false;
        if (rank == "优" && i == 0
            || rank == "特" && i != 2
            || rank == "神") {
            done = true;
        }

        var rankDisp = "";
        if (i == 0) {
            rankDisp = "优"
        } else if (i == 1) {
            rankDisp = "特"
        } else if (i == 2) {
            rankDisp = "神"
        }

        rankGuestsDisp += (done && mark ? "<span class='rank-done'>" : "")
            + rankDisp + "-" + (recipe.guests[i].guest ? recipe.guests[i].guest : "未知")
            + (done && mark ? "</span>" : "") + "<br>";

        if (!filter || filter && !done) {
            rankGuestsVal += " " + recipe.guests[i].guest + " ";
        }
    }

    var retData = {};
    retData["rankGuestsDisp"] = rankGuestsDisp;
    retData["rankGuestsVal"] = rankGuestsVal;
    return retData;
}

function getRankGiftInfo(recipe, rank) {
    var rankGiftDisp = recipe.gift;
    var rankGiftVal = "";

    var filter = $('#chk-recipe-filter-antique').prop("checked");
    var mark = $("#chk-setting-done-mark").prop("checked");

    if (rank == "神" && mark) {
        rankGiftDisp = "<span class='rank-done'>" + rankGiftDisp + "</span>";
    }

    if (!filter || filter && rank != "神") {
        rankGiftVal = recipe.gift;
    }

    var retData = {};
    retData["rankGiftDisp"] = rankGiftDisp;
    retData["rankGiftVal"] = rankGiftVal;
    return retData;
}

function ifUseEx(recipe) {
    var useEx = $("#chk-recipe-apply-ex").prop("checked");
    var useExPerson = $("#chk-recipe-apply-ex-person").prop("checked");

    if (useEx) {
        if (useExPerson && recipe.ex == "是" || !useExPerson) {
            return true;
        }
    }
    return false;
}

function getUltimateData(chefs, person, skills, useUltimate, usePerson) {
    var globalEffect = [];
    var partialEffect = [];
    var selfEffect = [];

    for (var i in chefs) {
        if (useUltimate && chefs[i].ultimateSkill) {
            var valid = false;
            if (usePerson) {
                if (person) {
                    for (var j in person.chefs) {
                        if (chefs[i].chefId == person.chefs[j].id) {
                            if (person.chefs[j].ult == "是") {
                                valid = true;
                                break;
                            }
                        }
                    }
                }
            } else {
                if (!chefs[i].hide) {
                    valid = true;
                }
            }

            if (valid) {
                for (var k in skills) {
                    if (chefs[i].ultimateSkill == skills[k].skillId) {
                        var tempEffect = [];
                        var tempEffect2 = [];
                        for (var m in skills[k].effect) {
                            if (skills[k].effect[m].condition == "Partial") {
                                tempEffect.push(skills[k].effect[m]);
                            } else if (skills[k].effect[m].condition == "Global") {
                                var found = false;
                                for (var n in globalEffect) {
                                    if (globalEffect[n].type == skills[k].effect[m].type
                                        && (globalEffect[n].cal == skills[k].effect[m].cal || !globalEffect[n].cal && !skills[k].effect[m].cal)
                                        && (globalEffect[n].tag == skills[k].effect[m].tag || !globalEffect[n].tag && !skills[k].effect[m].tag)
                                        && (globalEffect[n].rarity == skills[k].effect[m].rarity || !globalEffect[n].rarity && !skills[k].effect[m].rarity)) {
                                        globalEffect[n].value = +(globalEffect[n].value + skills[k].effect[m].value).toFixed(2);
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    globalEffect.push(JSON.parse(JSON.stringify(skills[k].effect[m])));
                                }
                            } else if (skills[k].effect[m].condition == "Self") {
                                tempEffect2.push(skills[k].effect[m]);
                            }
                        }
                        if (tempEffect.length) {
                            var partialData = {};
                            partialData["chefId"] = chefs[i].chefId;
                            partialData["effect"] = tempEffect;
                            partialEffect.push(partialData);
                        }
                        if (tempEffect2.length) {
                            var selfData = {};
                            selfData["chefId"] = chefs[i].chefId;
                            selfData["effect"] = tempEffect2;
                            selfEffect.push(selfData);
                        }
                        break;
                    }
                }
            }
        }
    }

    var result = {};
    result["global"] = globalEffect;
    result["partial"] = partialEffect;
    result["self"] = selfEffect;
    return result;
}

function setPartialUltimateOptions(chefs, skills) {
    var partialArray = [];
    for (var i in chefs) {
        if (chefs[i].ultimateSkill) {
            for (var k in skills) {
                if (chefs[i].ultimateSkill == skills[k].skillId) {
                    for (var m in skills[k].effect) {
                        if (skills[k].effect[m].condition == "Partial") {
                            var skillInfo = getSkillInfo(skills, skills[k].skillId);
                            var partialItem = {};
                            partialItem["skill"] = skillInfo;
                            partialItem["chef"] = chefs[i];
                            partialArray.push(partialItem);
                            break;
                        }
                    }
                }
            }
        }
    }

    partialArray.sort(function (a, b) {
        return a.skill.skillDisp.localeCompare(b.skill.skillDisp)
    });

    for (var i in partialArray) {
        var option = "<option value='" + partialArray[i].chef.chefId + "' data-subtext='" + partialArray[i].skill.skillDisp.replace(/<br>/g, " ") + "'>" + partialArray[i].chef.name + "</option>";
        var toAdd = false;
        for (var j in partialArray[i].skill.skillEffect) {
            if (partialArray[i].skill.skillEffect[j].condition == "Partial" && partialArray[i].skill.skillEffect[j].type != "OpenTime") {
                toAdd = true;
                break;
            }
        }
        if (toAdd) {
            $('#chk-chef-partial-ultimate').append(option);
        }
        $('#chk-cal-partial-ultimate').append(option);
    }
}

function setSelfUltimateOptions(chefs, skills) {
    for (var i in chefs) {
        if (chefs[i].ultimateSkill) {
            for (var k in skills) {
                if (chefs[i].ultimateSkill == skills[k].skillId) {
                    for (var m in skills[k].effect) {
                        if (skills[k].effect[m].condition == "Self") {
                            if (skills[k].effect[m].type != "Material_Gain" && skills[k].effect[m].type != "GuestDropCount") {
                                var skillInfo = getSkillInfo(skills, skills[k].skillId);
                                var option = "<option value='" + chefs[i].chefId + "' data-subtext='" + skillInfo.skillDisp.replace(/<br>/g, " ") + "'>" + chefs[i].name + "</option>";
                                $('#chk-cal-self-ultimate').append(option);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

function setExOptions(recipes) {
    for (var i in recipes) {
        var option = "<option value='" + recipes[i].recipeId + "' data-subtext='+" + recipes[i].exPrice + "'>" + recipes[i].name + "</option>";
        $('#chk-cal-ex').append(option);
    }
}

function setDataForRecipe(recipeData, ultimateData, useEx, showFinal) {
    recipeData["limitVal"] = recipeData.limit;
    recipeData["ultimateAddition"] = 0;

    for (var i in ultimateData) {
        if (ultimateData[i].type == "MaxEquipLimit" && ultimateData[i].rarity == recipeData.rarity) {
            recipeData.limitVal += ultimateData[i].value;
        }

        if (ultimateData[i].type == "UseAll" && ultimateData[i].rarity == recipeData.rarity) {
            recipeData.ultimateAddition = +(recipeData.ultimateAddition + ultimateData[i].value).toFixed(2);
        }
    }

    recipeData["limitDisp"] = getAtrributeDisp(recipeData.limitVal, recipeData.limit, showFinal);

    recipeData["ultimateAdditionDisp"] = getPercentDisp(recipeData.ultimateAddition);

    recipeData.price = recipeData.oPrice;
    if (useEx) {
        recipeData.price += recipeData.exPrice;
    }
    recipeData["priceDisp"] = getAtrributeDisp(recipeData.price, recipeData.oPrice, showFinal);

    recipeData["totalPrice"] = recipeData.price * recipeData.limitVal;
    recipeData["totalTime"] = recipeData.time * recipeData.limitVal;
    recipeData["totalTimeDisp"] = secondsToTime(recipeData.totalTime);
}

function getRankOptions() {
    var list = [];
    var option = {};
    option["display"] = "";
    option["value"] = "";
    list.push(option);
    option = {};
    option["display"] = "优";
    option["value"] = "优";
    list.push(option);
    option = {};
    option["display"] = "特";
    option["value"] = "特";
    list.push(option);
    option = {};
    option["display"] = "神";
    option["value"] = "神";
    list.push(option);

    return list;
}

function getGotOptions() {
    var list = [];
    var option = {};
    option["display"] = "否";
    option["value"] = "";
    list.push(option);
    option = {};
    option["display"] = "是";
    option["value"] = "是";
    list.push(option);

    return list;
}

function getEquipsOptions(equips, skills) {
    var list = [];
    var option = {};
    option["display"] = "无厨具";
    option["subtext"] = "";
    option["tokens"] = "";
    option["value"] = "";
    option["class"] = "hidden"
    list.push(option);
    for (var i in equips) {
        var skillInfo = getSkillInfo(skills, equips[i].skill);
        var skillDisp = skillInfo.skillDisp.replace(/<br>/g, " ");
        var option = {};
        option["display"] = equips[i].name;
        option["subtext"] = skillDisp;
        option["tokens"] = equips[i].name + skillDisp;
        option["value"] = equips[i].name;
        list.push(option);
    }
    return list;
}

function getChefsOptions(chefs) {
    var list = [];
    var option = {};
    option["display"] = "无厨师";
    option["value"] = "";
    option["class"] = "hidden"
    list.push(option);

    chefs.sort(function (a, b) {
        return b.rarity - a.rarity
    });

    var chkGot = $('#chk-cal-got').prop("checked");
    var chkNoOrigin = $('#chk-cal-no-origin').prop("checked");

    for (var i in chefs) {

        if (chkGot && !chefs[i].got) {
            continue;
        }

        if (!chkNoOrigin && !chefs[i].origin) {
            continue;
        }

        var option = {};
        option["display"] = chefs[i].name;
        option["value"] = chefs[i].name;
        list.push(option);
    }
    return list;
}

function getSkillInfo(skills, skillId) {
    var skillInfo = {};
    var skillDisp = "";
    var skillEffect = [];

    var skillIds = [];
    if (skillId.constructor === Array) {
        skillIds = skillId;
    } else {
        if (skillId) {
            skillIds.push(skillId);
        }
    }

    for (var j in skillIds) {
        var found = false;
        for (var k in skills) {
            if (skills[k].skillId == skillIds[j]) {
                skillDisp += skills[k].desc + "<br>";
                skillEffect = skillEffect.concat(skills[k].effect);
                found = true;
                break;
            }
        }
        if (!found) {
            console.log(skillIds[j]);
        }
    }
    skillInfo["skillDisp"] = skillDisp;
    skillInfo["skillEffect"] = skillEffect;
    return skillInfo;
}

function getSkillDisp(recipe) {
    var disp = "";
    if (recipe.stirfry) {
        disp += "炒" + recipe.stirfry;
    }
    if (recipe.boil) {
        disp += "煮" + recipe.boil;
    }
    if (recipe.knife) {
        disp += "切" + recipe.knife;
    }
    if (recipe.fry) {
        disp += "炸" + recipe.fry;
    }
    if (recipe.bake) {
        disp += "烤" + recipe.bake;
    }
    if (recipe.steam) {
        disp += "蒸" + recipe.steam;
    }
    return disp;
}

function getMaxLimit(data, rarity) {
    var limit = 0;
    if (rarity == 1) {
        limit = 40;
    } else if (rarity == 2) {
        limit = 30;
    } else if (rarity == 3) {
        limit = 25;
    } else if (rarity == 4) {
        limit = 20;
    } else if (rarity == 5) {
        limit = 15;
    }

    for (var i in data.ultimateData.global) {
        if (data.ultimateData.global[i].rarity == rarity && data.ultimateData.global[i].type == "MaxEquipLimit") {
            limit += data.ultimateData.global[i].value;
            break;
        }
    }

    return limit;
}

function monitorStyle() {
    $('select.monitor-all').on('changed.bs.select', function () {
        if ($(this).val().length == $(this).find("option").length) {
            $(this).selectpicker('setStyle', 'btn-info', 'remove');
        } else {
            $(this).selectpicker('setStyle', 'btn-info', 'add');
        }
    });

    $('select.monitor-none').on('changed.bs.select', function () {
        changeSelectStyle(this);
    });

    $('input[type=text].monitor-none').keyup(function () {
        changeInputStyle(this);
    });

    $('input[type=checkbox].monitor-none').click(function () {
        changeCheckStyle(this);
    });
}

function changeSelectStyle(select) {
    if ($(select).val().length == 0) {
        $(select).selectpicker('setStyle', 'btn-info', 'remove');
    } else {
        $(select).selectpicker('setStyle', 'btn-info', 'add');
    }
}

function changeInputStyle(input) {
    if ($.trim($(input).val()).length > 0) {
        $(input).addClass("btn-info");
    } else {
        $(input).removeClass("btn-info");
    }
}

function changeCheckStyle(check) {
    if ($(check).prop("checked")) {
        $(check).closest(".btn").addClass("btn-info");
    } else {
        $(check).closest(".btn").removeClass("btn-info");
    }
}

function checkMonitorStyle() {
    $('input[type=text].monitor-none').each(function () {
        changeInputStyle(this);
    });

    $('input[type=search].monitor-none').each(function () {
        changeInputStyle(this);
    });

    $('input[type=checkbox].monitor-none').each(function () {
        changeCheckStyle(this);
    });
}

function arraysEqual(array1, array2) {
    if (array1.length != array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        if (array2.indexOf(array1[i]) < 0) {
            return false;
        }
    }
    return true;
}

function changeTableHeaderClass(table, column, check) {
    if (check) {
        $(table.column(column).header()).removeClass("none never").addClass("all");
    } else {
        if ($('#chk-setting-expand').prop("checked")) {
            $(table.column(column).header()).removeClass("all never").addClass("none");
        } else {
            $(table.column(column).header()).removeClass("all none").addClass("never");
        }
    }
}

function initRecipeShow() {
    var recipeTable = $('#recipe-table').DataTable();

    $("#chk-recipe-show option").each(function () {
        changeTableHeaderClass(recipeTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-recipe-show option[value=4]').is(':selected');
    for (var i = 5; i <= 9; i++) {
        changeTableHeaderClass(recipeTable, i, chkSkill);
    }

    recipeTable.responsive.rebuild();
    recipeTable.responsive.recalc();
    recipeTable.columns.adjust().draw(false);
}

function initChefShow() {
    var chefTable = $('#chef-table').DataTable();

    $("#chk-chef-show option").each(function () {
        changeTableHeaderClass(chefTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-chef-show option[value=4]').is(':selected');
    for (var i = 5; i <= 9; i++) {
        changeTableHeaderClass(chefTable, i, chkSkill);
    }

    var chkExplore = $('#chk-chef-show option[value=11]').is(':selected');
    for (var i = 12; i <= 14; i++) {
        changeTableHeaderClass(chefTable, i, chkExplore);
    }

    chefTable.responsive.rebuild();
    chefTable.responsive.recalc();
    chefTable.columns.adjust().draw(false);
}

function initEquipShow() {
    var equipTable = $('#equip-table').DataTable();

    $("#chk-equip-show option").each(function () {
        changeTableHeaderClass(equipTable, Number($(this).val()), this.selected);
    });

    equipTable.responsive.rebuild();
    equipTable.responsive.recalc();
    equipTable.columns.adjust().draw(false);
}

function initDecorationShow() {
    var decorationTable = $('#decoration-table').DataTable();

    $("#chk-decoration-show option").each(function () {
        changeTableHeaderClass(decorationTable, Number($(this).val()), this.selected);
    });

    decorationTable.responsive.rebuild();
    decorationTable.responsive.recalc();
    decorationTable.columns.adjust().draw(false);
}

function initQuestShow(questTable) {
    questTable.column(1).visible($('#select-quest-type').val() == "支线任务", false);
    questTable.columns.adjust().draw(false);
}

function initCalChefsShow(calChefsTable) {

    $("#chk-cal-chefs-show option").each(function () {
        changeTableHeaderClass(calChefsTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-cal-chefs-show option[value=4]').is(':selected');
    for (var i = 5; i <= 9; i++) {
        changeTableHeaderClass(calChefsTable, i, chkSkill);
    }

    calChefsTable.responsive.rebuild();
    calChefsTable.responsive.recalc();
    calChefsTable.columns.adjust().draw(false);
}

function initCalEquipsShow(calEquipsTable) {

    $("#chk-cal-equips-show option").each(function () {
        changeTableHeaderClass(calEquipsTable, Number($(this).val()), this.selected);
    });

    calEquipsTable.responsive.rebuild();
    calEquipsTable.responsive.recalc();
    calEquipsTable.columns.adjust().draw(false);
}

function initCalMaterialsShow(calMaterialsTable) {

    $("#chk-cal-materials-show option").each(function () {
        changeTableHeaderClass(calMaterialsTable, Number($(this).val()), this.selected);
    });

    calMaterialsTable.responsive.rebuild();
    calMaterialsTable.responsive.recalc();
    calMaterialsTable.columns.adjust().draw(false);
}

function initCalResultsShow(mode, calResultsTable, panel) {

    calResultsTable.column(1).visible(false, false);    // group

    if (mode == "recipes") {
        panel.find('.chk-cal-results-show-recipe-rank').prop("checked", false).closest(".btn").addClass("hidden");
        panel.find('.chk-cal-results-show-recipe-rank-addition').prop("checked", false).closest(".btn").addClass("hidden");
        panel.find('.chk-cal-results-show-chef-skill-addition').prop("checked", false).closest(".btn").addClass("hidden");
        panel.find('.chk-cal-results-show-chef-equip-addition').prop("checked", false).closest(".btn").addClass("hidden");
        panel.find('.chk-cal-results-show-recipe-real-total-price').prop("checked", false).closest(".btn").addClass("hidden");

        if (private) {
            panel.find('.chk-cal-results-lock-order').closest(".header-wrapper").removeClass("hidden");
        } else {
            calResultsTable.column(0).visible(false, false);     // select
        }

        calResultsTable.column(2).visible(false, false);    // chef name
        calResultsTable.column(3).visible(false, false);   // equip
        calResultsTable.column(15).visible(false, false);   // quantity
        if (currentRule && currentRule.hasOwnProperty("MaterialsNum")) {
            calResultsTable.column(16).visible(true, false);   // available
            calResultsTable.column(17).visible(true, false);   // available score
        } else {
            calResultsTable.column(16).visible(false, false);   // available
            calResultsTable.column(17).visible(false, false);   // available score 
        }
    } else if (mode == "optimal") {
        calResultsTable.column(0).visible(false, false);     // select
        calResultsTable.column(16).visible(false, false);   // available
        calResultsTable.column(17).visible(false, false);   // available score
        calResultsTable.column(18).visible(false, false);   // max
    } else if (mode == "self-select") {
        panel.find('.chk-cal-results-show-recipe-id').prop("checked", false).closest(".btn").addClass("hidden");
        calResultsTable.column(0).visible(false, false);     // select
        calResultsTable.column(17).visible(false, false);   // available score
    }

    calResultsTable.column(4).visible(panel.find('.chk-cal-results-show-recipe-id').prop("checked"), false);
    calResultsTable.column(6).visible(panel.find('.chk-cal-results-show-recipe-rarity').prop("checked"), false);

    var chkRecipeSkill = panel.find('.chk-cal-results-show-recipe-skill').prop("checked");
    calResultsTable.column(7).visible(chkRecipeSkill, false);
    calResultsTable.column(8).visible(chkRecipeSkill, false);
    calResultsTable.column(9).visible(chkRecipeSkill, false);
    calResultsTable.column(10).visible(chkRecipeSkill, false);
    calResultsTable.column(11).visible(chkRecipeSkill, false);
    calResultsTable.column(12).visible(chkRecipeSkill, false);

    calResultsTable.column(13).visible(panel.find('.chk-cal-results-show-recipe-material').prop("checked"), false);
    calResultsTable.column(14).visible(panel.find('.chk-cal-results-show-recipe-origin').prop("checked"), false);
    calResultsTable.column(19).visible(panel.find('.chk-cal-results-show-recipe-price').prop("checked"), false);
    calResultsTable.column(20).visible(panel.find('.chk-cal-results-show-recipe-rank').prop("checked"), false);
    calResultsTable.column(21).visible(panel.find('.chk-cal-results-show-recipe-rank-addition').prop("checked"), false);
    calResultsTable.column(22).visible(panel.find('.chk-cal-results-show-chef-skill-addition').prop("checked"), false);
    calResultsTable.column(23).visible(panel.find('.chk-cal-results-show-chef-equip-addition').prop("checked"), false);
    calResultsTable.column(24).visible(panel.find('.chk-cal-results-show-bonus-addition').prop("checked"), false);
    calResultsTable.column(25).visible(panel.find('.chk-cal-results-show-ultimate-addition').prop("checked"), false);
    calResultsTable.column(26).visible(panel.find('.chk-cal-results-show-decoration-addition').prop("checked"), false);
    calResultsTable.column(27).visible(panel.find('.chk-cal-results-show-recipe-total-price').prop("checked"), false);
    calResultsTable.column(28).visible(panel.find('.chk-cal-results-show-recipe-real-total-price').prop("checked"), false);
    calResultsTable.column(29).visible(panel.find('.chk-cal-results-show-bonus-score').prop("checked"), false);
    calResultsTable.column(31).visible(panel.find('.chk-cal-results-show-total-time').prop("checked"), false);
    calResultsTable.column(32).visible(panel.find('.chk-cal-results-show-efficiency').prop("checked"), false);

    calResultsTable.columns.adjust().draw(false);
}

function initInfo(data) {
    $('#pagination-history').pagination({
        dataSource: data.history,
        callback: function (data, pagination) {
            var html = historyTemplate(data);
            $('#data-history').html(html);
        },
        pageSize: 5,
        showPageNumbers: false,
        showNavigator: true,
        showPrevious: true,
        showNext: true
    });
}

function historyTemplate(data) {
    var html = '<table class="table table-condensed history-table">';
    $.each(data, function (index, item) {
        html += '<tr><td class="history-dt">' + item.date + '</td><td>' + item.content + '<td></tr>';
    });
    html += "</table>"
    return html;
}

function initVersionTip(person) {
    $(".alert-version").each(function () {
        if ($(this).attr("data-show") == "true") {
            var key = $(this).attr("data-id");
            var value = Number($(this).attr("data-version"));
            var showTip = true;
            if (person && person[key]) {
                if (Number(person[key]) == value) {
                    showTip = false;
                }
            }
            if (showTip) {
                $(this).removeClass("hidden");
            }

            $(this).on('closed.bs.alert', function () {
                updateLocalData(key, value);
                updateScrollHeight();
            })
        }
    });
}

$.fn.dataTable.Api.register('MakeCellsEditable()', function (settings) {
    var table = this.table();

    $.fn.extend({
        // UPDATE
        updateEditableCell: function (callingElement, settings) {
            var table = $(callingElement).closest("table").DataTable().table();
            var row = table.row($(callingElement).parents('tr'));
            var cell = table.cell($(callingElement).closest("td"));
            var inputField = $(callingElement);

            // Update
            var oldValue = cell.data();
            var newValue = inputField.val();
            cell.data(newValue);
            if (settings.onUpdate) {
                settings.onUpdate(table, row, cell, oldValue);
            }
        }
    });

    // Destroy
    if (settings === "destroy") {
        $(table.body()).removeClass("processing");
        $(table.body()).off("click", "td");
        table = null;
    }

    if (table != null) {
        // On cell click
        $(table.body()).on('click', 'td', function () {
            if ($(table.body()).hasClass("processing")) {
                return;
            } else if ($(this).hasClass("child") || $(this).hasClass("dataTables_empty")) {
                return;
            }

            var currentRowIndex = table.cell(this).index().row;
            var currentColumnIndex = table.cell(this).index().column;

            // DETERMINE WHAT COLUMNS CAN BE EDITED
            if ((settings.columns && settings.columns.indexOf(currentColumnIndex) > -1) || (!settings.columns)) {

                var cell = table.cell(this).node();
                var oldValue = table.cell(this).data();
                // Sanitize value
                oldValue = sanitizeCellValue(oldValue);

                // Show input
                if (!$(cell).find('input').length && !$(cell).find('select').length) {

                    if (settings.waitUpdate) {
                        $(table.body()).addClass("processing");
                    }

                    // Input CSS
                    var input = getInputHtml(currentRowIndex, currentColumnIndex, settings, oldValue);
                    $(cell).html(input.html);
                    if (input.type == "input") {
                        $(cell).find("input").select().focus().on('focusout', function () {
                            $(this).updateEditableCell(this, settings);
                        });
                    } else if (input.type == "list") {
                        $(cell).find("select").selectpicker('hide').on('hidden.bs.select', function (e) {
                            $(this).updateEditableCell(this, settings);
                        });

                        setTimeout(function () {
                            $(cell).find("select").selectpicker('toggle').selectpicker('show');
                        }, 0);

                        if (input.settings.clear) {
                            $("<div class='bs-actionsbox'><div class='btn-group btn-group-sm btn-block'><button type='button' class='btn btn-default btn-bs-clear'>清空</button></div></div>")
                                .insertAfter($(cell).find(".bs-searchbox"));

                            $(cell).find(".btn-bs-clear").click(function () {
                                $(cell).find("select").selectpicker('val', '');
                                $(cell).find("select").selectpicker('hide');
                                $(this).updateEditableCell(this, settings);
                            });
                        }
                    }
                }
            }
        });
    }

});

function getInputHtml(currentRowIndex, currentColumnIndex, settings, oldValue) {
    var inputSetting, inputType, input;

    input = { "type": "input", "html": null, "settings": null }

    if (settings.inputTypes) {
        $.each(settings.inputTypes, function (index, setting) {
            if (setting.column == currentColumnIndex) {
                inputSetting = setting;
                inputType = inputSetting.type.toLowerCase();
            }
        });
    }

    input.settings = inputSetting;

    switch (inputType) {
        case "list":
            var searchable = "data-live-search='false'";
            if (inputSetting.search) {
                searchable = "data-live-search='true'";
            }

            input.html = "<select " + searchable + " data-width='fit' data-dropdown-align-right='auto' data-live-search-placeholder='查找' data-none-results-text='没有找到' data-none-selected-text=''>";

            var options;
            if (inputSetting.optionsp) {
                options = inputSetting.options[currentRowIndex];
            } else {
                options = inputSetting.options;
            }

            $.each(options, function (index, option) {
                input.html = input.html + "<option value='" + option.value + "'";
                if (option.tokens) {
                    input.html += " data-tokens='" + option.tokens + "'";
                }
                if (option.subtext) {
                    input.html += " data-subtext='" + option.subtext + "'";
                }
                if (option.class) {
                    input.html += " class='" + option.class + "'";
                }
                if (oldValue == option.value) {
                    input.html += " selected";
                }
                input.html += ">" + option.display + "</option>"
            });
            input.html = input.html + "</select>";
            input.type = inputType;
            break;
        default: // text input
            input.html = "<input class='form-control' value='" + oldValue + "'></input>";
            break;
    }
    return input;
}

function sanitizeCellValue(cellValue) {
    if (typeof (cellValue) === 'undefined' || cellValue === null || cellValue.length < 1) {
        return "";
    }

    // If not a number
    if (isNaN(cellValue)) {
        // escape single quote
        cellValue = cellValue.replace(/'/g, "&#39;");
    }
    return cellValue;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function UpdateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}