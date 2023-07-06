// $(function () {
//     if (window.location.href.indexOf("github") > 0) {
//         $('.loading-text').append("<h3>您访问的是github网站，如您是国内用户，建议使用gitee网站<a href='https://foodgame.gitee.io'>https://foodgame.gitee.io</a></h3>");
//     }
// });

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

    var person = getLocalData();

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

var private = false, calCustomRule, isMobile = false, expendBtn = true;
function initFunction() {
    var a = getParameterByName('a');
    if (a && lcode(a) == "cb8f8a72f7e4924a75cb75a4a59c0b8d61e70c0cb84f84edf7ede4c8") {
        private = true;
        $('head').append('<link rel="stylesheet" type="text/css" href="others/css/image.css">');
        $('#chk-recipe-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-chef-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-equip-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-decoration-no-origin').closest(".btn").removeClass('hidden');
        $('#chk-cal-results-lock-order').closest(".btn").removeClass("hidden");
        $('#btn-cal-recipes-select-all').removeClass("hidden");
        $('#btn-cal-recipes-deselect-all').removeClass("hidden");
    }
}

function initTables(data, person) {

    $.fn.selectpicker.Constructor.DEFAULTS.liveSearchStyle = "commaSplitContains";

    if ($(window).width() <= 768) {
        $('#chk-setting-desktop').bootstrapToggle('off');
        isMobile = true;
    }

    if (person) {
        if (person.desktop) {
            $('#chk-setting-desktop').bootstrapToggle('on');
            isMobile = false;
        } else if (person.desktop == false) {
            $('#chk-setting-desktop').bootstrapToggle('off');
            isMobile = true;
        }
    }

    updateSetting(person);

    if (isMobile) {
        $(".mobile-setting").hide();
        // overwrite updateSetting
        expendBtn = false;
    }

    initSetting(data);

    updateMenu(person);

    updateActivity(person);

    setPartialUltimateOptions(data.chefs, data.partialSkill);

    initRecipeTable(data);

    initChefTable(data);

    initEquipTable(data);

    initDecorationTable(data);

    initMaterialTable(data);

    initCondimentTable(data);

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

    $('.main-nav a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        if ($(e.target).attr("href") == ".pane-recipes") {
            $("#select-partial-ultimate").appendTo("#select-partial-ultimate-recipe");
        } else if ($(e.target).attr("href") == ".pane-chefs") {
            $("#select-partial-ultimate").appendTo("#select-partial-ultimate-chef");
        }
    });

    $('.main-nav a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (isMobile) {
            $('.dataTables_scrollBody:visible table.dataTable').DataTable().draw(false);
            if ($(this).attr("data-init") != "true") {
                updateScrollHeight();
            }
        } else {
            reInitFixedHeader();
        }
    });

    if (isMobile) {
        $('.dataTables_scrollBody table.dataTable').on('page.dt', function () {
            $(this).closest('.dataTables_scrollBody').scrollTop(0);
        });
    }

    var bsTimeout;
    $('.select-wrapper').hover(
        function () {
            if (!bsTimeout) {
                var element = $(this).find('.bootstrap-select');
                bsTimeout = setTimeout(function () {
                    if (!element.hasClass("open")) {
                        bsTimeout = null;
                        element.find("select").selectpicker('toggle');
                    }
                }, 200);
            }
        }, function () {
            if (bsTimeout) {
                window.clearTimeout(bsTimeout);
                bsTimeout = null;
            }
            var element = $(this).find('.bootstrap-select');
            if (element.hasClass("open")) {
                element.find("select").selectpicker('toggle');
            }
        }
    );

    monitorStyle();

    if (window.location.href.indexOf("github") > 0) {
        $('.loading h3').remove();
    }

    $('.loading').addClass("hidden");
    $('.main-function').removeClass("hidden");

    if (!isMobile) {
        reInitFixedHeader();
    }

    initLayout();

}

function reInitFixedHeader() {
    $('#recipe-table').DataTable().fixedHeader.adjust();
    $('#chef-table').DataTable().fixedHeader.adjust();
    $('#equip-table').DataTable().fixedHeader.adjust();
    $('#decoration-table').DataTable().fixedHeader.adjust();
    $('#quest-table').DataTable().fixedHeader.adjust();
    $('#condiment-table').DataTable().fixedHeader.adjust();
    $('#cal-recipes-table').DataTable().fixedHeader.adjust();
    if (private) {
        $('#cal-chefs-table').DataTable().fixedHeader.adjust();
        $('#cal-equips-table').DataTable().fixedHeader.adjust();
        $('#cal-materials-table').DataTable().fixedHeader.adjust();
    }
}

function updateScrollHeight() {
    var item = $('.dataTables_scrollBody:visible');
    var otherHeight = $('body').height() - item.height();
    var tableHeight = ($(window).height() - otherHeight - 5) + "px";
    var style = "height";
    if (item.closest(".pane-materials").length > 0) {
        style = "max-height";
    }
    if (item.css(style) != tableHeight) {
        item.css(style, tableHeight);
        item.find('table.dataTable').DataTable().columns.adjust().draw(false);
        $('.nav-tabs li.active a[data-toggle="tab"]').attr("data-init", "true");
    }
}

function initTableResponsiveDisplayEvent(table) {
    table.on('responsive-display', function (e, datatable, row, showHide, update) {
        if (showHide) {
            var nextTr = $(row.node()).next("tr");
            if (nextTr.length) {
                if (isMobile) {
                    var scroll = $(this).closest(".dataTables_scrollBody");
                    var nextTrHeight = nextTr.offset().top - scroll.offset().top + nextTr.outerHeight() - scroll.height();
                    if (nextTrHeight >= 0) {
                        scroll.scrollTop(nextTrHeight + scroll.scrollTop() + 10);
                    }
                } else {
                    var nextTrHeight = nextTr.offset().top + nextTr.outerHeight() - $(window).height();
                    if (nextTrHeight >= $(window).scrollTop()) {
                        $(window).scrollTop(nextTrHeight + 10);
                    }
                }
            }
        }
    });
}

function initTableScrollEvent(pane) {
    if (isMobile) {
        $(pane).find(".dataTables_scrollBody").on("scroll", function (e) {
            $(this).find(".child-inner").css("margin-left", $(this).scrollLeft() + "px");
        });
    }
}

function getResponsiveStyle(table) {
    var style = "";
    if (isMobile) {
        var scroll = table.closest(".dataTables_scroll").find(".dataTables_scrollBody");
        style = " style='max-width:" + (scroll.width() - 20) + "px;margin-left:" + scroll.scrollLeft() + "px'";
    }
    return style;
}

function initTooltip() {
    $('.tooltip-pin[data-toggle="tooltip"]').tooltip(
        {
            animation: false,
            delay: { "show": 0, "hide": 0 },
            trigger: "hover"
        }
    );
    $('body').on('click', function (e) {
        $('[data-toggle="tooltip"]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length == 0) {
                $(this).tooltip('hide');
            }
        });
    });
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
    $('#chk-setting-desktop').change(function () {
        updateLocalData("desktop", $('#chk-setting-desktop').prop("checked"));
        window.location.reload();
    });

    $('#chk-setting-show-help').change(function () {
        updateTooltip();
        updateSettingLocalData();
    });

    $('#chk-setting-expand-btn').change(function () {
        updateSettingLocalData();
        window.location.reload();
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

    $('#select-setting-page-length').on('changed.bs.select', function () {
        var length = $(this).val();
        $('#recipe-table').DataTable().page.len(length).draw();
        $('#chef-table').DataTable().page.len(length).draw();
        $('#equip-table').DataTable().page.len(length).draw();
        $('#decoration-table').DataTable().page.len(length).draw();
        $('#quest-table').DataTable().page.len(length).draw();
        $('#condiment-table').DataTable().page.len(length).draw();
        $('#cal-recipes-table').DataTable().page.len(length).draw();
        if (private) {
            $('#cal-chefs-table').DataTable().page.len(length).draw();
            $('#cal-equips-table').DataTable().page.len(length).draw();
            $('#cal-materials-table').DataTable().page.len(length).draw();
        }

        updateSettingLocalData();
    });
}

function initLayout() {
    if (isMobile) {
        $('#top-menu').appendTo("#menu-modal .modal-body");
        $('#mobile-menu-btn').removeClass("hidden");
        document.getElementById("viewport").setAttribute("content", "width=device-width");
        updateScrollHeight();
    } else {
        $('#top-menu').appendTo("#desktop-menu");
        $('#mobile-menu-btn').addClass("hidden");
        document.getElementById("viewport").setAttribute("content", "");
    }
}

function initRecipeTable(data) {

    reInitRecipeTable(data);

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $("#chk-recipe-rarity").val();
        if (checks.length == 0) {
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
        if (checks.length == 0) {
            return true;
        }

        var multiple = $('#chk-recipe-multiple-skill').prop("checked");

        for (var i in checks) {
            if (rowData["" + checks[i] + ""] > 0) {
                if (!multiple) {
                    return true;
                }
            } else {
                if (multiple) {
                    return false;
                }
            }
        }
        if (multiple) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $("#chk-recipe-category").val();
        if (checks.length == 0) {
            return true;
        }

        var multiple = $('#chk-recipe-multiple-category').prop("checked");

        for (var i in checks) {
            if (rowData["" + checks[i] + ""]) {
                if (!multiple) {
                    return true;
                }
            } else {
                if (multiple) {
                    return false;
                }
            }
        }
        if (multiple) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var checks = $("#chk-recipe-condiment").val();
        if (checks.length == 0) {
            return true;
        }

        for (var i in checks) {
            if (rowData.condiment == checks[i]) {
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
        if (rowData.price >= min) {
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

    var recipeSearchInput = $(".pane-recipes .search-box input");
    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var value = $.trim(recipeSearchInput.val());
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

        if (data.allSelectedMaterials.length == 0) {
            return true;
        }

        var multiple = $('#chk-recipe-multiple-material').prop("checked");

        for (var i in data.allSelectedMaterials) {
            var pass = false;
            for (var j in rowData.materials) {
                if (rowData.materials[j].material == data.allSelectedMaterials[i]) {
                    pass = true;
                    break;
                }
            }
            if (pass) {
                if (!multiple) {
                    return true;
                }
            } else {
                if (multiple) {
                    return false;
                }
            }
        }
        if (multiple) {
            return true;
        } else {
            return false;
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
                        if (rowData.price < oneQuest[i].price) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].category) {
                        if (!rowData["" + oneQuest[i].category + ""]) {
                            pass = false;
                        }
                    }
                    if (oneQuest[i].condiment) {
                        if (rowData.condiment != oneQuest[i].condiment) {
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
            $('#recipe-table').DataTable().order([33, 'desc']); // first material eff
        }
        $('#recipe-table').DataTable().draw();
        // if (isSelected) {
        //     $(this).selectpicker('toggle');
        // }
    });

    $('#chk-recipe-multiple-material').click(function () {
        $('#recipe-table').DataTable().draw();
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
        $('#recipe-table').DataTable().order([16, 'asc']).draw();   // time
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
        $('#recipe-table').DataTable().order([16, 'asc']).draw();   // time
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
        $('#select-recipe-quest').append("<optgroup label='" + data.activities[i].name + "'></optgroup>");
    }

    for (var j in data.quests) {
        if (data.quests[j].hasOwnProperty("conditions")) {
            var option = "<option value='" + data.quests[j].questId + "' data-tokens='" + data.quests[j].type + "'>" + data.quests[j].questIdDisp + ". " + data.quests[j].goal + "</option>";
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

    $('#chk-recipe-multiple-skill').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-category').on('changed.bs.select', function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-multiple-category').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-condiment').on('changed.bs.select', function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#input-recipe-price').on('input', function () {
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
        $('#chk-recipe-rarity').selectpicker("deselectAll");
        $("#chk-recipe-skill").selectpicker("deselectAll");
        $("#chk-recipe-multiple-skill").prop("checked", false);
        $("#chk-recipe-category").selectpicker("deselectAll");
        $("#chk-recipe-multiple-category").prop("checked", false);
        $('#chk-recipe-condiment').selectpicker("deselectAll");
        $("#chk-recipe-combo").prop("checked", false);
        $("#chk-recipe-ex-no").prop("checked", false);
        $("#chk-recipe-got").prop("checked", false);
        $("#chk-recipe-no-origin").prop("checked", true);
        $('#input-recipe-price').val("");
        $("#chk-recipe-guest").selectpicker("deselectAll");
        $("#chk-recipe-rank-guest").prop("checked", true);
        $("#chk-recipe-antique").selectpicker("deselectAll");
        $('#chk-recipe-show-material').selectpicker("deselectAll");
        $("#chk-recipe-multiple-material").prop("checked", false);
        $(".pane-recipes .search-box input").val("");
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
                    text += data.quests[i].goal + "<br>";

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
                                order = [16, 'asc'];  // time
                            }
                        }

                        if (data.quests[i].conditions[j].materialId && data.quests[i].conditions[j].materialEff) {
                            questMaterials.push(data.quests[i].conditions[j].materialId);
                            order = [33, 'desc'];   // first material eff
                        } else if (data.quests[i].conditions[j].materialEff) {
                            order = [21, 'desc'];   // allMaterialsEff
                        } else if (data.quests[i].conditions[j].condimentEff) {
                            order = [22, 'desc'];   // condimentEff
                        } else if (data.quests[i].conditions[j].goldEff) {
                            order = [20, 'desc'];  // efficiency
                        } else {
                            order = [16, 'asc'];  // time
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
        order = [[data.recipeColNum + data.recipeAddColNum - 2, 'asc'], [16, 'asc']];   // skill diff, time
    }

    $('#recipe-table').DataTable().order(order).draw();
}

function reInitRecipeTable(data) {
    var recipeColumns = [
        {
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
        },
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
                "_": "condiment",
                "display": "condimentDisp"
            },
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
            "data": "condimentEff",
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
            "data": {
                "_": "rank",
                "sort": "rankSort"
            },
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

    var searchValue = "";
    var order = [];

    if ($.fn.DataTable.isDataTable('#recipe-table')) {
        searchValue = $(".pane-recipes .search-box input").val();
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [3]
        };

    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var recipeTable = $('#recipe-table').DataTable({
        data: data.recipes,
        columns: recipeColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_"
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: order,
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i == 0) {
                                continue;
                            } else if (i > 5 && i <= 10) {
                                continue;
                            } else if (i == 5) {
                                data += "<div class='col-lg-3 col-xs-6'>";
                                for (var j = 5; j <= 10; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            }
                            else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + (columns[i].data ? columns[i].data : i == 30 ? "无" : i == 31 || i == 32 ? "否" : "")     // rank, ex, got
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }

                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#recipe-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $(".pane-recipes div.search-box").html('<input type="search" value="' + searchValue + '" class="form-control input-sm monitor-none" placeholder="查找 菜名 材料 来源">');

    var rankOptions = getRankOptions();
    var gotOptions = getGotOptions();
    recipeTable.MakeCellsEditable({
        "columns": [30, 31, 32],  // rank, ex, got
        "inputTypes": [
            {
                "column": 30,   // rank
                "type": "list",
                "options": rankOptions
            },
            {
                "column": 31,   // ex
                "type": "list",
                "options": gotOptions
            },
            {
                "column": 32,   // got
                "type": "list",
                "options": gotOptions
            }
        ],
        "onUpdate": function (table, row, cell, oldValue) {
            if (cell.index().column == 30) {// rank
                var recipe = row.data();

                recipe.rankSort = getRankSortValue(recipe.rank);

                var rankGuestInfo = getRankGuestInfo(recipe, recipe.rank);
                recipe.rankGuestsVal = rankGuestInfo.rankGuestsVal;
                recipe.rankGuestsDisp = rankGuestInfo.rankGuestsDisp;

                var rankGiftInfo = getRankGiftInfo(recipe, recipe.rank);
                recipe.rankGiftVal = rankGiftInfo.rankGiftVal;
                recipe.rankGiftDisp = rankGiftInfo.rankGiftDisp;

                row.data(recipe);
                recipeTable.draw(false);
            }

            if (cell.index().column == 31 && cell.data() != oldValue) {   // ex
                if ($("#chk-setting-auto-update").prop("checked")) {
                    updateRecipeChefTable(data);
                } else {
                    $("#btn-recipe-recal").closest(".inline-wrapper").removeClass("hidden");
                }
            }

            updateRecipesLocalData();
        }
    });

    $('.pane-recipes .search-box input').on('input', function () {
        recipeTable.draw();
        changeInputStyle(this);
    });

    initTableResponsiveDisplayEvent(recipeTable);
    initTableScrollEvent(".pane-recipes");
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
        if (isMobile) {
            updateScrollHeight();
        }
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
}

function updateRecipesChefsData(data) {
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var chkSkillDiff = $('#select-recipe-chef-quest').val();
    var chkChefs = $('#chk-recipe-show-chef').val();

    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var partialChefIds = $('#chk-chef-partial-ultimate').val();

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

                        var chef = JSON.parse(JSON.stringify(data.chefs[j]));

                        var newPartialChefIds = partialChefIds;
                        for (var p in data.ultimateData.partial) {
                            if (data.ultimateData.partial[p].chefId == chef.chefId) {
                                if (partialChefIds.indexOf(chef.chefId.toString()) < 0) {
                                    newPartialChefIds = partialChefIds.concat(chef.chefId);
                                }
                                break;
                            }
                        }

                        var partialChefAdds = getPartialChefAddsByIds(data.chefs, data.partialSkill, useUltimate, newPartialChefIds);
                        setDataForChef(chef, equip, useEquip, data.ultimateData.global, partialChefAdds, data.ultimateData.self, null, true, null);

                        var resultInfo = getRecipeResult(chef, equip, data.recipes[i],
                            data.recipes[i].limit, data.recipes[i].limit, data.materials,
                            null, 0, null, false, buildRecipeMenu(data.recipes[i]), null, null);

                        var resultData = {};
                        resultData["rankVal"] = resultInfo.rankVal;
                        resultData["rankDisp"] = resultInfo.rankDisp;
                        resultData["efficiency"] = resultInfo.chefEff || "";

                        if (chkSkillDiff.length) {
                            var skillDiff = getSkillDiff(chef, data.recipes[i], 4);
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

function getChefSillDiff(chef1, chef2) {
    var disp = "";
    var stirfry = chef1.stirfryVal - chef2.stirfryVal;
    if (stirfry > 0) {
        disp += "炒-" + stirfry + " ";
    }
    var boil = chef1.boilVal - chef2.boilVal;
    if (boil > 0) {
        disp += "煮-" + boil + " ";
    }
    var knife = chef1.knifeVal - chef2.knifeVal;
    if (knife > 0) {
        disp += "切-" + knife + " ";
    }
    var fry = chef1.fryVal - chef2.fryVal;
    if (fry > 0) {
        disp += "炸-" + fry + " ";
    }
    var bake = chef1.bakeVal - chef2.bakeVal;
    if (bake > 0) {
        disp += "-" + bake + " ";
    }
    var steam = chef1.steamVal - chef2.steamVal;
    if (steam > 0) {
        disp += "蒸-" + steam + " ";
    }
    if (disp != "") {
        disp = disp.slice(0, -1);
    }
    return disp;
}

function addCheffSkillDiff(chef, recipe) {
    if (recipe.stirfry > 0) {
        var stirfry = recipe.stirfry - chef.stirfryVal;
        if (stirfry > 0) {
            chef.stirfryVal += stirfry;
        }
    }
    if (recipe.boil > 0) {
        var boil = recipe.boil - chef.boilVal;
        if (boil > 0) {
            chef.boilVal += boil;
        }
    }
    if (recipe.knife > 0) {
        var knife = recipe.knife - chef.knifeVal;
        if (knife > 0) {
            chef.knifeVal += knife;
        }
    }
    if (recipe.fry > 0) {
        var fry = recipe.fry - chef.fryVal;
        if (fry > 0) {
            chef.fryVal += fry;
        }
    }
    if (recipe.bake > 0) {
        var bake = recipe.bake - chef.bakeVal;
        if (bake > 0) {
            chef.bakeVal += bake;
        }
    }
    if (recipe.steam > 0) {
        var steam = recipe.steam - chef.steamVal;
        if (steam > 0) {
            chef.steamVal += steam;
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

    if (disp != "") {
        disp = disp.slice(0, -1);
    }

    var result = {};
    result["disp"] = disp;
    result["value"] = -value;
    return result;
}

function updateChefTableData(data) {
    var chkSkillDiff = Number($('#chk-chef-show-skill-diff').val());
    var chkRecipes = $('#chk-chef-show-recipe').val();

    data.chefAddColNum = chkRecipes.length * (2 + (chkSkillDiff ? 1 : 0));
    if (data.chefAddColNum > data.chefAddColNumMax) {
        data.chefAddColNumMax = data.chefAddColNum;
        reInitChefTable(data);
        initChefShow();
        if (isMobile) {
            updateScrollHeight();
        }
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
                    $($('#chef-table').DataTable().column(data.chefColNum + chefAddColCount).header()).text(getSkillDiffText(chkSkillDiff)).removeClass("never").addClass("all");
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
}

function getSkillDiffText(chkSkillDiff) {
    if (chkSkillDiff == 5) {
        return "传差值"
    } else if (chkSkillDiff == 4) {
        return "神差值"
    } else if (chkSkillDiff == 3) {
        return "特差值"
    } else if (chkSkillDiff == 2) {
        return "优差值"
    }
    return "";
}

function updateChefsRecipesData(data) {
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var chkSkillDiff = Number($('#chk-chef-show-skill-diff').val());
    var chkRecipes = $('#chk-chef-show-recipe').val();

    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var partialChefIds = $('#chk-chef-partial-ultimate').val();

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

                        var chef = JSON.parse(JSON.stringify(data.chefs[i]));

                        var newPartialChefIds = partialChefIds;
                        for (var p in data.ultimateData.partial) {
                            if (data.ultimateData.partial[p].chefId == chef.chefId) {
                                if (partialChefIds.indexOf(chef.chefId.toString()) < 0) {
                                    newPartialChefIds = partialChefIds.concat(chef.chefId);
                                }
                                break;
                            }
                        }

                        var partialChefAdds = getPartialChefAddsByIds(data.chefs, data.partialSkill, useUltimate, newPartialChefIds);
                        setDataForChef(chef, equip, useEquip, data.ultimateData.global, partialChefAdds, data.ultimateData.self, null, true, null);

                        var resultInfo = getRecipeResult(chef, equip, data.recipes[j],
                            data.recipes[j].limit, data.recipes[j].limit, data.materials,
                            null, 0, null, false, buildRecipeMenu(data.recipes[j]), null, null);

                        var resultData = {};
                        resultData["rankVal"] = resultInfo.rankVal;
                        resultData["rankDisp"] = resultInfo.rankDisp;
                        resultData["efficiency"] = resultInfo.chefEff || "";

                        if (chkSkillDiff) {
                            var skillDiff = getSkillDiff(chef, data.recipes[j], chkSkillDiff);
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

        var checks = $("#chk-chef-rarity").val();
        if (checks.length == 0) {
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

        var checks = $("#chk-chef-gender").val();
        if (checks.length == 0) {
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

        var checks = $("#chk-chef-category").val();
        if (checks.length == 0) {
            return true;
        }

        var checkEquip = $("#chk-chef-category-equip").prop("checked");

        var effects = rowData.specialSkillEffect.concat(rowData.ultimateSkillEffect);
        if (checkEquip && rowData.equip) {
            effects = effects.concat(rowData.equip.effect);
        }

        for (var i in checks) {
            for (var j in effects) {
                if (effects[j].type == checks[i]) {
                    if (effects[j].type == "OpenTime") {
                        if (effects[j].value < 0) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var checks = $("#chk-chef-condiment").val();
        if (checks.length == 0) {
            return true;
        }

        for (var i in checks) {
            if (rowData[checks[i] + "Val"] > 0) {
                return true;
            }
        }
        return false;
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

        var check = $('#chk-chef-ultimate-no').prop("checked");
        if (!check || check && !rowData.ultimate) {
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

    var chefSearchInput = $(".pane-chefs .search-box input");
    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var value = $.trim(chefSearchInput.val());
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
    });

    $('#chk-chef-show-skill-diff').on('changed.bs.select', function () {
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

    $('#chk-chef-category').on('changed.bs.select', function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-category-equip').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-condiment').on('changed.bs.select', function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-ultimate-no').click(function () {
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
        $('#chk-chef-rarity').selectpicker("deselectAll");
        $("#chk-chef-gender").selectpicker("deselectAll");
        $('#chk-chef-category').selectpicker("deselectAll");
        $('#chk-chef-condiment').selectpicker("deselectAll");
        $("#chk-chef-ultimate-no").prop("checked", false);
        $("#chk-chef-got").prop("checked", false);
        $("#chk-chef-no-origin").prop("checked", true);
        $('#chk-chef-show-recipe').selectpicker("deselectAll");
        $(".pane-chefs .search-box input").val("");
        $('#chk-chef-partial-ultimate').selectpicker("deselectAll");
        checkMonitorStyle();
        $('#chef-table').DataTable().draw();
    });

    initChefShow();
}

function reInitChefTable(data) {
    var chefColumns = [
        {
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
        },
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
            "data": {
                "_": "sweetVal",
                "display": "sweetDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "sourVal",
                "display": "sourDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "spicyVal",
                "display": "spicyDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "saltyVal",
                "display": "saltyDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "bitterVal",
                "display": "bitterDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "tastyVal",
                "display": "tastyDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
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
                "_": "equipId",
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

    var searchValue = "";
    var order = [];

    if ($.fn.DataTable.isDataTable('#chef-table')) {
        searchValue = $(".pane-chefs .search-box input").val();
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 3]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var chefTable = $('#chef-table').DataTable({
        data: data.chefs,
        columns: chefColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_"
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: order,
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i == 0) {
                                continue;
                            } else if (i > 5 && i <= 10) {
                                continue;
                            } else if (i == 5) {
                                data += "<div class='col-lg-3 col-xs-6'>";
                                for (var j = 5; j <= 10; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            } else if (i > 12 && i <= 15) {
                                continue;
                            } else if (i == 12) {
                                data += "<div class='col-lg-3 col-xs-6'><span class='child-key'>采集：</span>";
                                for (var j = 12; j <= 15; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            } else if (i > 17 && i <= 22) {
                                continue;
                            } else if (i == 17) {
                                data += "<div class='col-lg-3 col-xs-6'><span class='child-key'>调料：</span>";
                                for (var j = 17; j <= 22; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            }
                            else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + (columns[i].data ? columns[i].data : i == 19 ? "无" : i == 22 || i == 23 ? "否" : "")
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }

                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#chef-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $(".pane-chefs div.search-box").html('<input type="search" value="' + searchValue + '" class="form-control input-sm monitor-none" placeholder="查找 名字 技能 来源">');

    var gotOptions = getGotOptions();
    var equipsOptions = getEquipsOptions(data.equips, data.skills);

    chefTable.MakeCellsEditable({
        "columns": [25, 28, 29],  // equipId, ultimate, got
        "inputTypes": [
            {
                "column": 25,   // equipId
                "type": "list",
                "search": true,
                "clear": true,
                "done": true,
                "options": equipsOptions
            },
            {
                "column": 28,   // ultimate
                "type": "list",
                "options": gotOptions
            },
            {
                "column": 29,   // got
                "type": "list",
                "options": gotOptions
            }
        ],
        "onUpdate": function (table, row, cell, oldValue) {
            if (cell.index().column == 25) {     // equipId
                var chef = row.data();
                var equip = null;
                var equipDisp = "";
                if (chef.equipId) {
                    for (var j in data.equips) {
                        if (chef.equipId == data.equips[j].equipId) {
                            equip = data.equips[j];
                            equipDisp = data.equips[j].disp;
                            break;
                        }
                    }
                }
                chef.equip = equip;
                chef.equipDisp = equipDisp;
                row.data(chef);
                chefTable.draw(false);
            }
            if ((cell.index().column == 25 || cell.index().column == 28) && cell.data() != oldValue) {   // equipId, ultimate
                if ($("#chk-setting-auto-update").prop("checked")) {
                    updateRecipeChefTable(data);
                } else {
                    $("#btn-chef-recal").closest(".inline-wrapper").removeClass("hidden");
                }
            }
            updateChefsLocalData();
        }
    });

    $('.pane-chefs .search-box input').on('input', function () {
        chefTable.draw();
        changeInputStyle(this);
    });

    initTableResponsiveDisplayEvent(chefTable);
    initTableScrollEvent(".pane-chefs");
}

function initEquipTable(data) {
    var equipColumns = [
        {
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
        },
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 3]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var equipTable = $('#equip-table').DataTable({
        data: data.equips,
        columns: equipColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_"
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: [],
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i == 0) {
                                continue;
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }

                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#equip-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $(".pane-equips div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 名字 技能 来源">');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var checks = $("#chk-equip-skill").val();
        if (checks.length == 0) {
            return true;
        }

        var effects = rowData.effect;
        var multiple = $('#chk-equip-multiple-skill').prop("checked");

        var negative = false;
        if (checks.length == 1 || multiple) {
            negative = $('#chk-equip-filter-negative-skill').prop("checked");
        }

        for (var i in checks) {
            var allPass = true;
            var values = checks[i].split(',');
            for (var j in values) {
                var exist = false;
                for (var k in effects) {
                    if (effects[k].type == values[j]) {
                        if (negative && effects[k].value < 0) {
                            return false;
                        }
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    if (multiple) {
                        return false;
                    }
                    allPass = false;
                    break;
                }
            }
            if (!multiple && allPass) {
                return true;
            }
        }
        if (multiple) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var check = $('#chk-equip-filter-all-skill').prop("checked");
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

    var equipSearchInput = $(".pane-equips .search-box input");
    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var value = $.trim(equipSearchInput.val());
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

    $('#chk-equip-skill').selectpicker().on('changed.bs.select', function () {
        var oneType = "";
        if ($(this).val().length == 1) {
            oneType = $(this).val()[0];
            equipTable.order([5, 'desc']);  // skill
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

    $('#chk-equip-multiple-skill').click(function () {
        equipTable.draw();
    });

    $('#chk-equip-filter-negative-skill').click(function () {
        equipTable.draw();
    });

    $('#chk-equip-filter-all-skill').click(function () {
        equipTable.draw();
    });

    $('.pane-equips .search-box input').on('input', function () {
        equipTable.draw();
        changeInputStyle(this);
    });

    $('#btn-equip-reset').click(function () {
        $('#chk-equip-skill').selectpicker("deselectAll");
        $("#chk-equip-multiple-skill").prop("checked", false);
        $("#chk-equip-filter-negative-skill").prop("checked", false);
        $("#chk-equip-filter-all-skill").prop("checked", false);
        $("#chk-equip-no-origin").prop("checked", true);
        $(".pane-equips .search-box input").val("");
        checkMonitorStyle();
        equipTable.draw();
    });

    initTableResponsiveDisplayEvent(equipTable);
    initTableScrollEvent(".pane-equips");

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
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
        },
        {
            "data": "id",
            "width": "1px"
        },
        {
            "data": "icon",
            "className": "td-decoration-icon",
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
            "data": {
                "_": "tAvgEff",
                "display": "avgEffDisp"
            },
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 4]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var decorationTable = $('#decoration-table').DataTable({
        data: data.decorations,
        columns: decorationColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_",
            select: {
                rows: {
                    _: "选择了 %d 个装饰",
                    0: "",
                    1: "选择了 %d 个装饰"
                }
            }
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [[0, "desc"], [11, "desc"]],  //avg eff
        deferRender: false, // for select
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i < 2) {
                                continue;
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 4 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }

                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#decoration-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $(".pane-decorations div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 名字 套装 来源">');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var checks = $("#chk-decoration-position").val();
        if (checks.length == 0) {
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

    var decorationSearchInput = $(".pane-decorations .search-box input");
    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var value = $.trim(decorationSearchInput.val());
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

    $('#chk-decoration-position').on('changed.bs.select', function () {
        decorationTable.draw();
    });

    $('#chk-decoration-no-origin').click(function () {
        decorationTable.draw();
    });

    $('.pane-decorations .search-box input').on('input', function () {
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
        $('#chk-decoration-position').selectpicker("deselectAll");
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
    initTableScrollEvent(".pane-decorations");

    initDecorationShow();
}

function updateDecorationSum(data) {
    var selectedData = $('#decoration-table').DataTable().rows({ selected: true }).data().toArray();
    var tEff = 0;
    var rEff = 0;
    var gold = 0;
    var suits = [];
    for (var i in selectedData) {
        if (selectedData[i].suit && suits.indexOf(selectedData[i].suit) < 0) {
            suits.push(selectedData[i].suit);
        }
        if (selectedData[i].tAvgEff) {
            tEff += selectedData[i].tAvgEff;
        }
        if (selectedData[i].rAvgEff) {
            rEff += selectedData[i].rAvgEff;
        }
        gold += selectedData[i].gold;
    }

    var suitGold = 0;
    for (var i in suits) {
        suitGold += getSuitGold(data, selectedData, suits[i]);
    }

    var sum = "";
    if (selectedData.length) {
        sum = "平均玉璧/天: " + getDecorationAvgEffDisp(tEff, rEff) + " 收入加成: " + getPercentDisp(+((gold + suitGold) * 100).toFixed(2));
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

    $("#input-material-addition, #input-material-skill").on('input', function () {
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

    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        scrollX = true;
        fixedColumns = {
            left: [0]
        };
    }

    var materialTable = $('#material-table').DataTable({
        data: materialsData,
        columns: materialColumns,
        dom: "<'row'<'col-sm-12'tr>>",
        paging: false,
        ordering: false,
        info: false,
        deferRender: true,
        autoWidth: false,
        scrollX: scrollX,
        fixedColumns: fixedColumns
    });

    initTableScrollEvent(".pane-materials");

    materialTable.draw();
}

function initCondimentTable(data) {
    var condimentColumns = [
        {
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
        },
        {
            "data": "condimentId",
            "width": "1px"
        },
        {
            "data": "icon",
            "className": "td-condiment-icon",
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 3]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var condimentTable = $('#condiment-table').DataTable({
        data: data.condiments,
        columns: condimentColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_"
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: [],
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i == 0) {
                                continue;
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }

                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#condiment-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $(".pane-condiments div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 名字 技能 来源">');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('condiment-table')) {
            return true;
        }

        var checks = $("#chk-condiment-origin").val();
        if (checks.length == 0) {
            return true;
        }

        for (var i in checks) {
            if (checks[i] == rowData.origin) {
                return true;
            }
        }

        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('condiment-table')) {
            return true;
        }

        var checks = $("#chk-condiment-skill").val();
        if (checks.length == 0) {
            return true;
        }

        var multiple = $('#chk-condiment-multiple-skill').prop("checked");
        var effects = rowData.effect;

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
                    if (multiple) {
                        return false;
                    }
                    allPass = false;
                    break;
                }
            }
            if (!multiple && allPass) {
                return true;
            }
        }
        if (multiple) {
            return true;
        } else {
            return false;
        }
    });

    var condimentSearchInput = $(".pane-condiments .search-box input");
    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('condiment-table')) {
            return true;
        }

        var value = $.trim(condimentSearchInput.val());
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

    $('#chk-condiment-show').on('changed.bs.select', function () {
        initCondimentShow();
        updateMenuLocalData();
    });

    $('#chk-condiment-origin').on('changed.bs.select', function () {
        condimentTable.draw();
    });

    $('#chk-condiment-skill').selectpicker().on('changed.bs.select', function () {
        var oneType = "";
        if ($(this).val().length == 1) {
            oneType = $(this).val()[0];
            condimentTable.order([5, 'desc']);  // skill
        }

        condimentTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
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
        condimentTable.draw();
    });

    $('#chk-condiment-multiple-skill').click(function () {
        condimentTable.draw();
    });

    $('.pane-condiments .search-box input').on('input', function () {
        condimentTable.draw();
        changeInputStyle(this);
    });

    $('#btn-condiment-reset').click(function () {
        $('#chk-condiment-origin').selectpicker("deselectAll");
        $('#chk-condiment-skill').selectpicker("deselectAll");
        $("#chk-condiment-multiple-skill").prop("checked", false);
        $(".pane-condiments .search-box input").val("");
        checkMonitorStyle();
        condimentTable.draw();
    });

    initTableResponsiveDisplayEvent(condimentTable);
    initTableScrollEvent(".pane-condiments");

    initCondimentShow();
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            leftColumns: [0]
        };
    }

    var questTable = $('#quest-table').DataTable({
        data: questsData,
        columns: questColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_"
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: [],
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns
    });

    $(".pane-quest div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 编号 任务 奖励">');

    var questSearchInput = $(".pane-quest .search-box input");
    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('quest-table')) {
            return true;
        }

        var value = $.trim(questSearchInput.val());
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

    $('.pane-quest .search-box input').on('input', function () {
        questTable.draw();
        changeInputStyle(this);
    });

    $('#select-quest-type').selectpicker().change(function () {
        var questsData = getQuestsData(data.quests, $(this).val());
        questTable.clear().rows.add(questsData).draw();
        initQuestShow(questTable);
    });

    initTableScrollEvent(".pane-quest");

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
            $('#file-import').val("");
        }, 0);
    });

    $('#btn-import-bcjh-cloud').click(function () {
        $("#import-msg-bcjh-cloud").html("导入中...").removeClass("hidden");

        if (!$("#input-import-bcjh-cloud").val()) {
            $("#import-msg-bcjh-cloud").html("输入数据ID !");
            return;
        }

        setTimeout(function () {
            $.ajax({
                cache: false,
                success: function (bjson) {
                    if (bjson.result) {
                        var success = importDataBcjh(bjson.data);
                        if (success) {
                            $("#import-msg-bcjh-cloud").html("导入成功 !");
                        } else {
                            $("#import-msg-bcjh-cloud").html("导入失败 !");
                        }
                    } else {
                        $("#import-msg-bcjh-cloud").html(bjson.msg);
                    }
                },
                error: function () {
                    $("#import-msg-bcjh-cloud").html("获取失败 !");
                },
                url: 'https://bcjh.xyz/api/download_data?id=' + $("#input-import-bcjh-cloud").val()
            });
        }, 0);
    });

    $('#btn-import-bcjh-text').click(function () {
        $("#import-msg-bcjh-text").html("导入中...").removeClass("hidden");
        setTimeout(function () {
            var success = importDataBcjh($("#input-import-bcjh-text").val());
            if (success) {
                $("#import-msg-bcjh-text").html("导入成功 !");
            } else {
                $("#import-msg-bcjh-text").html("导入失败 !");
            }
        }, 0);
    });

    $('#file-import-bcjh').change(function () {
        $("#import-msg-bcjh-file").html("导入中...").removeClass("hidden");
        setTimeout(function () {
            var file = document.getElementById("file-import-bcjh").files[0];
            var reader = new FileReader();
            reader.onload = function (event) {
                var success = importDataBcjh(event.target.result);
                if (success) {
                    $("#import-msg-bcjh-file").html("导入成功 !");
                } else {
                    $("#import-msg-bcjh-file").html("导入失败 !");
                }
            };
            reader.readAsText(file, "UTF-8");
            $('#file-import-bcjh').val("");
        }, 0);
    });
}

function importDataBcjh(input) {
    var bcjh;
    try {
        bcjh = JSON.parse(input);
    } catch (e) {
        return false;
    }

    var ultimate = bcjh.userUltimate;
    var repGot = bcjh.repGot;
    var chefGot = bcjh.chefGot;
    if (!ultimate || !repGot || !chefGot) {
        return false;
    }

    $("#input-cal-decoration").val(ultimate.decoBuff);
    $("#input-cal-ultimate-stirfry").val(ultimate.Stirfry);
    $("#input-cal-ultimate-boil").val(ultimate.Boil);
    $("#input-cal-ultimate-knife").val(ultimate.Knife);
    $("#input-cal-ultimate-fry").val(ultimate.Fry);
    $("#input-cal-ultimate-bake").val(ultimate.Bake);
    $("#input-cal-ultimate-steam").val(ultimate.Steam);
    $("#input-cal-ultimate-male-skill").val((Number(ultimate.Male) + Number(ultimate.All)) || "");
    $("#input-cal-ultimate-female-skill").val((Number(ultimate.Female) + Number(ultimate.All)) || "");
    $("#input-cal-ultimate-1-limit").val(ultimate.MaxLimit_1);
    $("#input-cal-ultimate-2-limit").val(ultimate.MaxLimit_2);
    $("#input-cal-ultimate-3-limit").val(ultimate.MaxLimit_3);
    $("#input-cal-ultimate-4-limit").val(ultimate.MaxLimit_4);
    $("#input-cal-ultimate-5-limit").val(ultimate.MaxLimit_5);
    $("#input-cal-ultimate-1-price").val(ultimate.PriceBuff_1);
    $("#input-cal-ultimate-2-price").val(ultimate.PriceBuff_2);
    $("#input-cal-ultimate-3-price").val(ultimate.PriceBuff_3);
    $("#input-cal-ultimate-4-price").val(ultimate.PriceBuff_4);
    $("#input-cal-ultimate-5-price").val(ultimate.PriceBuff_5);

    var partialIds = [];
    for (var i in ultimate.Partial.id) {
        partialIds.push(ultimate.Partial.id[i].split(',')[0]);
    }
    $('#chk-cal-partial-ultimate').selectpicker('val', partialIds);

    var selfIds = [];
    for (var i in ultimate.Self.id) {
        selfIds.push(ultimate.Self.id[i].split(',')[0]);
    }
    $('#chk-cal-self-ultimate').selectpicker('val', selfIds);

    for (var r in calCustomRule.rules) {
        var rule = calCustomRule.rules[r];
        for (var i in rule.recipes) {
            for (var j in repGot) {
                if (j == rule.recipes[i].recipeId) {
                    rule.recipes[i].got = repGot[j];
                    break;
                }
            }
        }

        for (var i in rule.chefs) {
            for (var j in chefGot) {
                if (j == rule.chefs[i].chefId) {
                    rule.chefs[i].got = chefGot[j];
                    break;
                }
            }
        }
    }

    $('#cal-recipes-table').DataTable().draw();

    return true;
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
                    data.recipes[i].rankSort = getRankSortValue(person.recipes[j].rank);

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
                            data.chefs[i].equipId = data.equips[k].equipId;
                            data.chefs[i].equipDisp = data.equips[k].disp;
                            break;
                        }
                    }
                } else {
                    data.chefs[i].equip = null;
                    data.chefs[i].equipId = "";
                    data.chefs[i].equipDisp = "";
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
    $("#select-cal-rule").append(options).selectpicker('destroy').selectpicker();

    if (person.calChefs) {
        $('#cal-chefs-table').DataTable().rows().deselect();
        $('#cal-chefs-table').DataTable().rows(function (idx, data, node) {
            for (var i in person.calChefs) {
                if (data.chefId == person.calChefs[i]) {
                    return true;
                }
            }
            return false;
        }).select();
    }

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

    var old = getLocalData();
    if (!old.cal) {
        old["cal"] = [];
    }

    for (var i in person.cal) {
        var opt = "";
        var exist1 = false;
        for (var j in old.cal) {
            if (person.cal[i].id == old.cal[j].id) {
                for (var m in person.cal[i].data) {
                    var exist2 = false;
                    for (var n in old.cal[j].data) {
                        if (person.cal[i].data[m].score == old.cal[j].data[n].score) {
                            old.cal[j].data[n].menu = person.cal[i].data[m].menu;
                            exist2 = true;
                            break;
                        }
                    }
                    if (!exist2) {
                        old.cal[j].data.push(person.cal[i].data[m]);
                        if (person.cal[i].id == calCustomRule.id) {
                            opt += "<option value='" + person.cal[i].data[m].score + "'>" + person.cal[i].data[m].score + "</option>";
                        }
                    }
                }
                exist1 = true;
                break;
            }
        }
        if (!exist1) {
            old.cal.push(person.cal[i]);
            if (person.cal[i].id == calCustomRule.id) {
                for (var m in person.cal[i].data) {
                    opt += "<option value='" + person.cal[i].data[m].score + "'>" + person.cal[i].data[m].score + "</option>";
                }
            }
        }
        if (opt) {
            $("#select-cal-custom").append(opt).selectpicker('destroy').selectpicker();
        }
    }

    updateCalLocalData(old.cal);

    updateMenu(person);
    updateSetting(person);

    if (person.decorationEffect) {
        data.decorationEffect = person.decorationEffect;
        $("#input-cal-decoration").val(person.decorationEffect || "");
    }

    updateActivity(person);

    try {
        localStorage.setItem('data', generateExportData());
    } catch (e) { }

    data = getUpdateData(data);

    updateRecipeTableData(data);
    updateChefTableData(data);
    initRecipeShow();
    initChefShow();
    initEquipShow();
    initDecorationShow();
    initCondimentShow();

    return true;
}

function updateCalLocalData(cal) {
    updateLocalData("cal", cal);
}

function updateRecipesLocalData() {
    updateLocalData("recipes", generateRecipesExportData());
}

function updateChefsLocalData() {
    updateLocalData("chefs", generateChefsExportData());
}

function updateMenuLocalData() {
    updateLocalData("menu", generateMenuExportData());
}

function updateSettingLocalData() {
    updateLocalData("setting", generateSettingExportData());
}

function updateDecorationLocalData() {
    updateLocalData("decorationEffect", Number($("#input-cal-decoration").val()));
}

function updateActivityLocalData() {
    updateLocalData("activity", generateActivityExportData());
}

function updateLocalData(key, value) {
    var person = getLocalData();

    person[key] = value;

    try {
        localStorage.setItem('data', JSON.stringify(person));
    } catch (e) { }
}

function getLocalData() {
    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    if (!person) {
        person = {};
    }
    return person;
}

function generateExportData() {
    var old = getLocalData();
    var person = {};
    person["recipes"] = generateRecipesExportData();
    person["chefs"] = generateChefsExportData();
    person["menu"] = generateMenuExportData();
    person["setting"] = generateSettingExportData();
    person["decorationEffect"] = Number($("#input-cal-decoration").val());
    person["activity"] = generateActivityExportData();
    person["cal"] = old.cal;
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
    exportData["version"] = 4;
    exportData["recipe"] = $("#chk-recipe-show").val();
    exportData["chef"] = $("#chk-chef-show").val();
    exportData["equip"] = $("#chk-equip-show").val();
    exportData["decoration"] = $("#chk-decoration-show").val();
    exportData["condiment"] = $("#chk-condiment-show").val();
    exportData["calChef"] = $("#chk-cal-chef-show").val();
    exportData["calEquip"] = $("#chk-cal-equip-show").val();
    exportData["calRecipe"] = $("#chk-cal-recipe-show").val();
    return exportData;
}

function updateMenu(person) {
    if (person && person.menu) {
        if (person.menu.version == 2) {
            updateMenu2to3(person.menu.recipe, "0");
            updateMenu2to3(person.menu.chef, "0");
            updateMenu2to3(person.menu.equip, "0");
            updateMenu2to3(person.menu.decoration, "1");
            updateMenu2to3(person.menu.condiment, "0");
        }

        if (person.menu.version < 4) {
            updateMenu3to4(person.menu.recipe);
        }

        $("#chk-recipe-show").selectpicker('val', person.menu.recipe)
        $("#chk-chef-show").selectpicker('val', person.menu.chef);
        $("#chk-equip-show").selectpicker('val', person.menu.equip);
        $("#chk-decoration-show").selectpicker('val', person.menu.decoration);
        $("#chk-condiment-show").selectpicker('val', person.menu.condiment);

        if (person.menu.calChef) {
            $("#chk-cal-chef-show").selectpicker('val', person.menu.calChef);
            $("#chk-cal-equip-show").selectpicker('val', person.menu.calEquip);
            $("#chk-cal-recipe-show").selectpicker('val', person.menu.calRecipe);
        }
    }
}

function updateMenu2to3(list, add) {
    for (var i in list) {
        list[i] = (Number(list[i]) + 1).toString();
    }
    list.push(add);
}

function updateMenu3to4(list) {
    for (var i in list) {
        if (Number(list[i]) > 21) {
            list[i] = (Number(list[i]) + 1).toString();
        }
    }
}

function generateSettingExportData() {
    var exportData = {};
    exportData["help"] = $("#chk-setting-show-help").prop("checked");
    exportData["expandbtn"] = $("#chk-setting-expand-btn").prop("checked");
    exportData["auto"] = $("#chk-setting-auto-update").prop("checked");
    exportData["final"] = $("#chk-setting-show-final").prop("checked");
    exportData["mark"] = $("#chk-setting-done-mark").prop("checked");
    exportData["pagelen"] = Number($("#select-setting-page-length").val());
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
        if ($('#chk-setting-expand-btn').prop("checked") != person.setting.expandbtn) {
            if (person.setting.expandbtn) {
                $('#chk-setting-expand-btn').bootstrapToggle('on');
            } else {
                $('#chk-setting-expand-btn').bootstrapToggle('off');
                expendBtn = false;
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
        if (Number($("#select-setting-page-length").val()) != person.setting.pagelen) {
            if (person.setting.pagelen) {
                $("#select-setting-page-length").selectpicker('val', person.setting.pagelen);
            }
        }
    }
}


function generateActivityExportData() {
    var exportData = {};
    exportData["stirfryPrice"] = $("#input-cal-activity-stirfry-price").val();
    exportData["bakePrice"] = $("#input-cal-activity-bake-price").val();
    exportData["steamPrice"] = $("#input-cal-activity-steam-price").val();
    exportData["boilPrice"] = $("#input-cal-activity-boil-price").val();
    exportData["fryPrice"] = $("#input-cal-activity-fry-price").val();
    exportData["knifePrice"] = $("#input-cal-activity-knife-price").val();
    exportData["sourPrice"] = $("#input-cal-activity-sour-price").val();
    exportData["sweetPrice"] = $("#input-cal-activity-sweet-price").val();
    exportData["bitterPrice"] = $("#input-cal-activity-bitter-price").val();
    exportData["spicyPrice"] = $("#input-cal-activity-spicy-price").val();
    exportData["saltyPrice"] = $("#input-cal-activity-salty-price").val();
    exportData["tastyPrice"] = $("#input-cal-activity-tasty-price").val();
    exportData["vegetablePrice"] = $("#input-cal-activity-vegetable-price").val();
    exportData["creationPrice"] = $("#input-cal-activity-creation-price").val();
    exportData["fishPrice"] = $("#input-cal-activity-fish-price").val();
    exportData["meatPrice"] = $("#input-cal-activity-meat-price").val();
    exportData["goldPrice"] = $("#input-cal-activity-gold-price").val();
    exportData["stirfry"] = $("#input-cal-activity-stirfry").val();
    exportData["bake"] = $("#input-cal-activity-bake").val();
    exportData["steam"] = $("#input-cal-activity-steam").val();
    exportData["boil"] = $("#input-cal-activity-boil").val();
    exportData["fry"] = $("#input-cal-activity-fry").val();
    exportData["knife"] = $("#input-cal-activity-knife").val();
    exportData["limit1"] = $("#input-cal-activity-1-limit").val();
    exportData["limit2"] = $("#input-cal-activity-2-limit").val();
    exportData["limit3"] = $("#input-cal-activity-3-limit").val();
    exportData["limit4"] = $("#input-cal-activity-4-limit").val();
    exportData["limit5"] = $("#input-cal-activity-5-limit").val();
    return exportData;
}

function updateActivity(person) {
    var activity = person && person.activity;
    if (activity) {
        $("#input-cal-activity-stirfry-price").val(activity.stirfryPrice);
        $("#input-cal-activity-bake-price").val(activity.bakePrice);
        $("#input-cal-activity-steam-price").val(activity.steamPrice);
        $("#input-cal-activity-boil-price").val(activity.boilPrice);
        $("#input-cal-activity-fry-price").val(activity.fryPrice);
        $("#input-cal-activity-knife-price").val(activity.knifePrice);
        $("#input-cal-activity-sour-price").val(activity.sourPrice);
        $("#input-cal-activity-sweet-price").val(activity.sweetPrice);
        $("#input-cal-activity-bitter-price").val(activity.bitterPrice);
        $("#input-cal-activity-spicy-price").val(activity.spicyPrice);
        $("#input-cal-activity-salty-price").val(activity.saltyPrice);
        $("#input-cal-activity-tasty-price").val(activity.tastyPrice);
        $("#input-cal-activity-vegetable-price").val(activity.vegetablePrice);
        $("#input-cal-activity-creation-price").val(activity.creationPrice);
        $("#input-cal-activity-fish-price").val(activity.fishPrice);
        $("#input-cal-activity-meat-price").val(activity.meatPrice);
        $("#input-cal-activity-gold-price").val(activity.goldPrice);
        $("#input-cal-activity-stirfry").val(activity.stirfry);
        $("#input-cal-activity-bake").val(activity.bake);
        $("#input-cal-activity-steam").val(activity.steam);
        $("#input-cal-activity-boil").val(activity.boil);
        $("#input-cal-activity-fry").val(activity.fry);
        $("#input-cal-activity-knife").val(activity.knife);
        $("#input-cal-activity-1-limit").val(activity.limit1);
        $("#input-cal-activity-2-limit").val(activity.limit2);
        $("#input-cal-activity-3-limit").val(activity.limit3);
        $("#input-cal-activity-4-limit").val(activity.limit4);
        $("#input-cal-activity-5-limit").val(activity.limit5);
    }
}

function initCalTables(data) {

    calCustomRule = {};
    calCustomRule["id"] = 0;
    calCustomRule["score"] = 0;
    calCustomRule["rules"] = [];

    setSelfUltimateOptions(data.chefs, data.skills);
    setExOptions(data.recipes);
    initCalRecipesTable();
    initCalCustomTable(data);
    initCalRules(data);

    if (private) {
        $(".pane-cal").addClass("admin");

        initCalChefsTable(data);
        initCalEquipsTable(data);
        initCalMaterialsTable(data);

        $('#input-cal-thread').val(navigator.hardwareConcurrency);
    } else {
        $(".admin-only").remove();
    }
}

function showCalSubPane() {
    $(".pane-cal-sub").addClass("hidden");
    var chk = $("input[name='rad-cal-pane-options']:checked");

    if (chk.attr("data-pane") == ".pane-cal-recipes" && $("#pane-cal-recipes").attr("data-cal") == "false") {
        $("#pane-cal-recipes").attr("data-cal", "true");
        calRecipesResults();
    }

    $(chk.attr("data-pane")).removeClass("hidden");

    if (isMobile) {
        $('.dataTables_scrollBody:visible table.dataTable').DataTable().draw(false);
        if ($(chk).attr("data-init") != "true") {
            $(chk).attr("data-init", "true");
            updateScrollHeight();
        }
    } else {
        reInitFixedHeader();
    }
}

function initCalRules(data) {
    var options = "";
    for (var i in data.rules) {
        options += "<option value='" + data.rules[i].Id + "'>" + data.rules[i].Title + "</option>";
    }
    $("#select-cal-rule").append(options).selectpicker().change(function () {
        $("#btn-cal-rule-load").addClass("btn-danger");
    });

    $("#input-cal-decoration").val(data.decorationEffect || "");

    loadUltimate(data, true);

    $("#btn-cal-rule-load").click(function () {
        if ($(this).hasClass("btn-danger")) {
            loadCalRule(data);
        } else {
            bootbox.confirm({
                size: "small",
                message: "<div class='text-center'>确定重新加载?</div>",
                locale: "zh_CN",
                callback: function (result) {
                    if (result) {
                        loadCalRule(data);
                    }
                }
            });
        }
    });

    $("input[name='rad-cal-pane-options']").change(function () {
        showCalSubPane();
    });

    $("#input-cal-decoration").on('input', function () {
        updateDecorationLocalData();
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $(".cal-settings input").on('input', function () {
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $('#chk-cal-partial-ultimate').selectpicker().on('changed.bs.select', function () {
        setCalConfigData(data);
        calCustomResults(data);
    });

    $('#chk-cal-self-ultimate').selectpicker().on('changed.bs.select', function () {
        setCalConfigData(data);
        calCustomResults(data);
    });

    $('#chk-cal-ex').selectpicker().on('changed.bs.select', function () {
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $("#btn-cal-load-ultimate").click(function () {
        $("#cal-ultimate input").val("");
        loadUltimate(data, true);
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $("#btn-cal-load-all-ultimate").click(function () {
        $("#cal-ultimate input").val("");
        loadUltimate(data, false);
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $("#btn-cal-clear-ultimate").click(function () {
        $("#cal-ultimate input").val("");
        $('#chk-cal-partial-ultimate').selectpicker('deselectAll').selectpicker('refresh');;
        $('#chk-cal-self-ultimate').selectpicker('deselectAll').selectpicker('refresh');;
        $('#chk-cal-ex').selectpicker('deselectAll').selectpicker('refresh');;
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $("#cal-activity input").on('input', function () {
        updateActivityLocalData();
    });

    $("#btn-cal-clear-activity").click(function () {
        $("#cal-activity input").val("");
        updateActivityLocalData();
        setCalConfigData(data);
        calCustomResults(data);
        $("#pane-cal-recipes").attr("data-cal", "false");
    });

    $('#select-cal-order').change(function () {
        sortRecipesResult();
    });

    if (isMobile) {
        $("#chk-cal-details").prop("checked", false);
        $(".recipe-box").addClass("no-details");
    }

    $("#chk-cal-details").click(function () {
        if ($(this).prop("checked")) {
            $(".recipe-box").removeClass("no-details");
        } else {
            $(".recipe-box").addClass("no-details");
        }
    });

    $("#btn-cal-clear-custom").click(function () {
        initCustomData();
        calCustomResults(data);

        var currentRule = calCustomRule.rules[0];
        if (currentRule.hasOwnProperty("MaterialsNum")) {
            $("#pane-cal-recipes").attr("data-cal", "false");
        }
    });

    $('#btn-cal-reset-custom').click(function () {
        $("#chk-cal-got").prop("checked", false);
        $('#chk-cal-recipe-rarity').selectpicker("deselectAll");
        $("#chk-cal-recipe-skill").selectpicker("deselectAll");
        $("#chk-cal-recipe-multiple-skill").prop("checked", false);
        $('#chk-cal-recipe-condiment').selectpicker("deselectAll");
        checkMonitorStyle();
        $('#cal-recipes-table').DataTable().draw();
    });

    $('#btn-cal-custom-load').click(function () {
        var score = $("#select-cal-custom").val();
        if (!score) {
            return;
        }
        var person = getLocalData();
        for (var i in person.cal) {
            if (person.cal[i].id == calCustomRule.id) {
                for (var j in person.cal[i].data) {
                    if (person.cal[i].data[j].score == score) {
                        var menu = person.cal[i].data[j].menu;
                        for (var groupIndex in menu) {
                            for (var chefIndex in menu[groupIndex]) {
                                var item = menu[groupIndex][chefIndex];
                                setCustomChef(groupIndex, chefIndex, item.chef);
                                setCustomEquip(groupIndex, chefIndex, item.equip);
                                setCustomCondiment(groupIndex, chefIndex, item.condiment, data);
                                for (var recipeIndex in item.recipes) {
                                    var recipe = item.recipes[recipeIndex];
                                    setCustomRecipe(groupIndex, chefIndex, recipeIndex, recipe.id);
                                    setCustomRecipeQuantity(groupIndex, chefIndex, recipeIndex, recipe.qty);
                                    updateCustomRecipeCondiment(groupIndex, chefIndex, recipeIndex, recipe.cdt);
                                }
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
        calCustomResults(data);

        if (calCustomRule.rules[0].hasOwnProperty("MaterialsNum")) {
            $("#pane-cal-recipes").attr("data-cal", "false");
        }
    });

    $('#btn-cal-custom-delete').click(function () {
        var score = $("#select-cal-custom").val();
        if (!score) {
            return;
        }
        bootbox.confirm({
            size: "small",
            message: "<div class='text-center'>确定删除?</div>",
            locale: "zh_CN",
            callback: function (result) {
                if (result) {
                    var person = getLocalData();
                    for (var i in person.cal) {
                        if (person.cal[i].id == calCustomRule.id) {
                            for (var j in person.cal[i].data) {
                                if (person.cal[i].data[j].score == score) {
                                    person.cal[i].data.splice(j, 1);
                                    $("#select-cal-custom option[value='" + score + "']").remove();
                                    $("#select-cal-custom").selectpicker('destroy').selectpicker();
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    updateCalLocalData(person.cal);
                }
            }
        });
    });

    $("#btn-cal-custom-save").click(function () {
        if (!calCustomRule.score) {
            return;
        }

        var person = getLocalData();
        if (!person.cal) {
            person["cal"] = [];
        }

        var item = {};
        item["score"] = calCustomRule.score;
        item["menu"] = [];
        for (var r in calCustomRule.rules) {
            var item1 = [];
            var customData = calCustomRule.rules[r].custom;
            for (var i in customData) {
                var item2 = {};
                item2["chef"] = customData[i].chef.chefId;
                item2["equip"] = customData[i].equip.equipId;
                item2["condiment"] = customData[i].condiment.condimentId;
                item2["recipes"] = [];
                for (var j in customData[i].recipes) {
                    var item3 = {};
                    if (customData[i].recipes[j].data) {
                        item3["id"] = customData[i].recipes[j].data.recipeId;
                        item3["qty"] = customData[i].recipes[j].quantity;
                        item3["cdt"] = customData[i].recipes[j].useCondiment;
                    }
                    item2.recipes.push(item3);
                }
                item1.push(item2);
            }
            item.menu.push(item1);
        }

        var add = false;
        var exist1 = false;
        for (var i in person.cal) {
            if (person.cal[i].id == calCustomRule.id) {
                var exist2 = false;
                for (var j in person.cal[i].data) {
                    if (person.cal[i].data[j].score == item.score) {
                        person.cal[i].data[j].menu = item.menu;
                        exist2 = true;
                        break;
                    }
                }
                if (!exist2) {
                    person.cal[i].data.push(item);
                    add = true;
                }
                exist1 = true;
                break;
            }
        }
        if (!exist1) {
            var calItem = {};
            calItem["id"] = calCustomRule.id;
            calItem["data"] = [];
            calItem.data.push(item);
            person.cal.push(calItem);
            add = true;
        }

        if (add) {
            var opt = "<option value='" + item.score + "'>" + item.score + "</option>";
            $("#select-cal-custom").append(opt).selectpicker('destroy').selectpicker('val', item.score);
        }

        updateCalLocalData(person.cal);
    });

    $('#chk-cal-chef-show').on('changed.bs.select', function () {
        updateMenuLocalData();
    });

    $('#chk-cal-equip-show').on('changed.bs.select', function () {
        updateMenuLocalData();
    });

    $('#chk-cal-recipe-show').on('changed.bs.select', function () {
        updateMenuLocalData();
    });
}

function loadCalRule(data) {
    var ruleId = Math.floor($("#select-cal-rule").val());
    calCustomRule.rules = [];
    for (var i in data.rules) {
        if (data.rules[i].Id == ruleId) {
            calCustomRule.id = ruleId;
            if (data.rules[i].Group) {
                for (var m in data.rules[i].Group) {
                    calCustomRule.rules.push(data.rules[i].Group[m]);
                }
            } else {
                calCustomRule.rules.push(data.rules[i]);
            }
            break;
        }
    }

    $(".btn-resize").hide();
    $(".cal-custom-item").hide();
    for (var groupIndex = 0; groupIndex < calCustomRule.rules.length; groupIndex++) {
        $(".cal-custom-item:eq(" + groupIndex + ")").show();
        var btn = $(".cal-custom-item:eq(" + groupIndex + ") .btn-resize");
        if (btn.hasClass("glyphicon-resize-full")) {
            btn.click();
        }
        if (calCustomRule.rules.length > 1) {
            btn.show();
        }
    }

    $(".cal-custom-item .selected-item .recipe-box .recipe-condiment input").prop("checked", true);

    if (calCustomRule.rules.length > 1) {
        $(".pane-cal-recipes").hide();
    } else {
        $(".pane-cal-recipes").show();
    }

    var person = getLocalData();
    var options = "";
    for (var i in person.cal) {
        if (person.cal[i].id == calCustomRule.id) {
            for (var m in person.cal[i].data) {
                options += "<option value='" + person.cal[i].data[m].score + "'>" + person.cal[i].data[m].score + "</option>";
            }
            break;
        }
    }
    $("#select-cal-custom").html(options).selectpicker('destroy').selectpicker();

    $("#btn-cal-rule-load").prop("disabled", true);
    $('.loading').removeClass("hidden");

    setTimeout(function () {

        loadRule(data, calCustomRule);
        setCalConfigData(data);

        $("#pane-cal-recipes").attr("data-cal", "false");
        $('.loading').addClass("hidden");
        $(".cal-menu").removeClass("hidden");
        showCalSubPane();
        $("#btn-cal-rule-load").prop("disabled", false).removeClass("btn-danger");

    }, 0);
}

function loadUltimate(data, usePerson) {
    var person = getLocalData();

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
        } else if (globalUltimate[i].type == "UseAll" && globalUltimate[i].rarity == 1) {
            $("#input-cal-ultimate-1-price").val(globalUltimate[i].value);
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
        } else if (globalUltimate[i].type == "Material_Gain"
            || globalUltimate[i].type == "Material_Vegetable") {
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

function setCalConfigData(data) {

    for (var r in calCustomRule.rules) {
        var rule = calCustomRule.rules[r];

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

        var price1 = Number($("#input-cal-ultimate-1-price").val());
        if (price1) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseAll";
            ultimateItem["value"] = price1;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            ultimateItem["rarity"] = 1;
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

        var selfChefIds = $('#chk-cal-self-ultimate').val();
        for (var i in selfChefIds) {
            selfChefIds[i] = Number(selfChefIds[i]);
        }
        var selfUltimateData = getSelfUltimateData(data.chefs, data.skills, true, selfChefIds);

        var activityUltimateData = getActivityConfigData(rule);

        rule["calGlobalUltimateData"] = globalUltimate;
        rule["calPartialChefIds"] = partialChefIds;
        rule["calSelfUltimateData"] = selfUltimateData;
        rule["calActivityUltimateData"] = activityUltimateData;

        var exRecipeIds = $('#chk-cal-ex').val();
        for (var i in exRecipeIds) {
            exRecipeIds[i] = Number(exRecipeIds[i]);
        }

        for (var i in rule.menus) {
            var useEx = exRecipeIds.indexOf(rule.menus[i].recipe.data.recipeId) >= 0;
            setDataForRecipe(rule.menus[i].recipe.data, globalUltimate, useEx, activityUltimateData, true, rule);

            var quantity = getRecipeQuantity(rule.menus[i].recipe.data, rule.materials, rule);

            var resultData = getRecipeResult(null, null, rule.menus[i].recipe.data, quantity, quantity, rule.materials,
                rule, rule.decorationEffect, null, false, buildRecipeMenu(rule.menus[i].recipe.data), null, null);
            resultData["available"] = quantity;
            resultData["availableScore"] = Math.ceil(+(resultData.totalScore / resultData.max * quantity).toFixed(2));;

            rule.menus[i].recipe = resultData;
        }

        for (var i in rule.chefs) {
            setDataForChef(rule.chefs[i], null, false, globalUltimate, null, selfUltimateData, activityUltimateData, true, rule);
        }

    }
}

function getActivityConfigData(rule) {
    var activityUltimate = [];

    if (rule.IsActivity) {
        var stirfry = Number($("#input-cal-activity-stirfry").val());
        if (stirfry) {
            var ultimateItem = {};
            ultimateItem["type"] = "Stirfry";
            ultimateItem["value"] = stirfry;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            activityUltimate.push(ultimateItem);
        }

        var boil = Number($("#input-cal-activity-boil").val());
        if (boil) {
            var ultimateItem = {};
            ultimateItem["type"] = "Boil";
            ultimateItem["value"] = boil;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            activityUltimate.push(ultimateItem);
        }

        var knife = Number($("#input-cal-activity-knife").val());
        if (knife) {
            var ultimateItem = {};
            ultimateItem["type"] = "Knife";
            ultimateItem["value"] = knife;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            activityUltimate.push(ultimateItem);
        }

        var fry = Number($("#input-cal-activity-fry").val());
        if (fry) {
            var ultimateItem = {};
            ultimateItem["type"] = "Fry";
            ultimateItem["value"] = fry;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            activityUltimate.push(ultimateItem);
        }

        var bake = Number($("#input-cal-activity-bake").val());
        if (bake) {
            var ultimateItem = {};
            ultimateItem["type"] = "Bake";
            ultimateItem["value"] = bake;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            activityUltimate.push(ultimateItem);
        }

        var steam = Number($("#input-cal-activity-steam").val());
        if (steam) {
            var ultimateItem = {};
            ultimateItem["type"] = "Steam";
            ultimateItem["value"] = steam;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            activityUltimate.push(ultimateItem);
        }

        var limit1 = Number($("#input-cal-activity-1-limit").val());
        if (limit1) {
            var ultimateItem = {};
            ultimateItem["type"] = "MaxEquipLimit";
            ultimateItem["value"] = limit1;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            ultimateItem["rarity"] = 1;
            activityUltimate.push(ultimateItem);
        }

        var limit2 = Number($("#input-cal-activity-2-limit").val());
        if (limit2) {
            var ultimateItem = {};
            ultimateItem["type"] = "MaxEquipLimit";
            ultimateItem["value"] = limit2;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            ultimateItem["rarity"] = 2;
            activityUltimate.push(ultimateItem);
        }

        var limit3 = Number($("#input-cal-activity-3-limit").val());
        if (limit3) {
            var ultimateItem = {};
            ultimateItem["type"] = "MaxEquipLimit";
            ultimateItem["value"] = limit3;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            ultimateItem["rarity"] = 3;
            activityUltimate.push(ultimateItem);
        }

        var limit4 = Number($("#input-cal-activity-4-limit").val());
        if (limit4) {
            var ultimateItem = {};
            ultimateItem["type"] = "MaxEquipLimit";
            ultimateItem["value"] = limit4;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            ultimateItem["rarity"] = 4;
            activityUltimate.push(ultimateItem);
        }

        var limit5 = Number($("#input-cal-activity-5-limit").val());
        if (limit5) {
            var ultimateItem = {};
            ultimateItem["type"] = "MaxEquipLimit";
            ultimateItem["value"] = limit5;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Abs";
            ultimateItem["rarity"] = 5;
            activityUltimate.push(ultimateItem);
        }

        var stirfryPrice = Number($("#input-cal-activity-stirfry-price").val());
        if (stirfryPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseStirfry";
            ultimateItem["value"] = stirfryPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var boilPrice = Number($("#input-cal-activity-boil-price").val());
        if (boilPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseBoil";
            ultimateItem["value"] = boilPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var knifePrice = Number($("#input-cal-activity-knife-price").val());
        if (knifePrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseKnife";
            ultimateItem["value"] = knifePrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var fryPrice = Number($("#input-cal-activity-fry-price").val());
        if (fryPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseFry";
            ultimateItem["value"] = fryPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var bakePrice = Number($("#input-cal-activity-bake-price").val());
        if (bakePrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseBake";
            ultimateItem["value"] = bakePrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var steamPrice = Number($("#input-cal-activity-steam-price").val());
        if (steamPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseSteam";
            ultimateItem["value"] = steamPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var vegetablePrice = Number($("#input-cal-activity-vegetable-price").val());
        if (vegetablePrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseVegetable";
            ultimateItem["value"] = vegetablePrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var meatPrice = Number($("#input-cal-activity-meat-price").val());
        if (meatPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseMeat";
            ultimateItem["value"] = meatPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var creationPrice = Number($("#input-cal-activity-creation-price").val());
        if (creationPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseCreation";
            ultimateItem["value"] = creationPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var fishPrice = Number($("#input-cal-activity-fish-price").val());
        if (fishPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseFish";
            ultimateItem["value"] = fishPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var sweetPrice = Number($("#input-cal-activity-sweet-price").val());
        if (sweetPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseSweet";
            ultimateItem["value"] = sweetPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var sourPrice = Number($("#input-cal-activity-sour-price").val());
        if (sourPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseSour";
            ultimateItem["value"] = sourPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var spicyPrice = Number($("#input-cal-activity-spicy-price").val());
        if (spicyPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseSpicy";
            ultimateItem["value"] = spicyPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var saltyPrice = Number($("#input-cal-activity-salty-price").val());
        if (saltyPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseSalty";
            ultimateItem["value"] = saltyPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var bitterPrice = Number($("#input-cal-activity-bitter-price").val());
        if (bitterPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseBitter";
            ultimateItem["value"] = bitterPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var tastyPrice = Number($("#input-cal-activity-tasty-price").val());
        if (tastyPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "UseTasty";
            ultimateItem["value"] = tastyPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }

        var goldPrice = Number($("#input-cal-activity-gold-price").val());
        if (goldPrice) {
            var ultimateItem = {};
            ultimateItem["type"] = "Gold_Gain";
            ultimateItem["value"] = goldPrice;
            ultimateItem["condition"] = "Global";
            ultimateItem["cal"] = "Percent";
            activityUltimate.push(ultimateItem);
        }
    }

    return activityUltimate;
}

function loadRule(data, customRule) {
    $("#input-cal-decoration").prop("disabled", true);
    $("#cal-activity").hide();

    for (var groupIndex = 0; groupIndex < customRule.rules.length; groupIndex++) {

        var rule = customRule.rules[groupIndex];

        if (!rule.DisableDecorationEffect) {
            $("#input-cal-decoration").prop("disabled", false);
        }

        if (rule.IsActivity) {
            $("#cal-activity").show();
        }

        var ruleDesc = "";
        if (rule.Satiety) {
            for (var i = 0; i < rule.IntentList.length; i++) {
                ruleDesc += "<div class='item'>第" + (i + 1) + "轮:";
                for (var j in rule.IntentList[i]) {
                    for (var k in data.intents) {
                        if (rule.IntentList[i][j] == data.intents[k].intentId) {
                            ruleDesc += "<span class='intent-" + i + j + " label label-default'>" + data.intents[k].desc + "</span>";
                            break;
                        }
                    }
                }
                ruleDesc += "</div>";
            }

            if (rule.SatisfyRewardType == 1) {
                ruleDesc += "<div class='item'><span class='intent-satiety label label-default'>饱腹感达到" + rule.Satiety + "时总售价+"
                    + rule.SatisfyExtraValue + "%</span></div>";
            }
            $("#pane-cal-custom").addClass("banquet");
        } else {
            $("#pane-cal-custom").removeClass("banquet");
        }
        $(".rule-desc:eq(" + groupIndex + ")").html(ruleDesc);

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

            var resultData = getRecipeResult(null, null, rule.recipes[j], quantity, quantity, rule.materials,
                rule, rule.decorationEffect, null, false, buildRecipeMenu(rule.recipes[j]), null, null);
            resultData["available"] = quantity;
            resultData["availableScore"] = resultData.totalScore / resultData.max * quantity;

            var menuData = {};
            menuData["recipe"] = resultData;
            menus.push(menuData);
        }
        rule["menus"] = menus;

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

        if (customRule.rules.length == 1) {
            sortRecipesResult();
            $("#cal-recipes-table").DataTable().clear().rows.add(menus).draw();
            initCalRecipesShow($('#cal-recipes-table').DataTable());

            if (private) {
                $('#cal-chefs-table').DataTable().clear().rows.add(chefs).draw();
                $('#btn-cal-chefs-deselect-all').click();
                $('#cal-equips-table').DataTable().clear().rows.add(equips).draw();
                $('#btn-cal-equips-deselect-all').click();
                $('#cal-materials-table').DataTable().clear().rows.add(materials).draw();
                $('#btn-cal-materials-select-all').click();
            }
        }

    }

    initCustomData();
    calCustomResults(data);
}

function initCustomData() {
    for (var r in calCustomRule.rules) {
        var rule = calCustomRule.rules[r];
        rule["custom"] = [];
        for (var i = 0; i < 3; i++) {
            var oneMenu = {};
            oneMenu["chef"] = {};
            oneMenu["equip"] = {};
            oneMenu["condiment"] = {};
            oneMenu["recipes"] = [];

            for (var j = 0; j < 3; j++) {
                var oneRecipe = {};
                oneMenu.recipes.push(oneRecipe);
            }
            rule.custom.push(oneMenu);
        }
    }
}

function setCustomChef(groupIndex, index, chefId) {
    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;
    if (chefId) {
        for (var i in currentRule.chefs) {
            if (currentRule.chefs[i].chefId == chefId) {
                customData[index].chef = JSON.parse(JSON.stringify(currentRule.chefs[i]));
                break;
            }
        }
    } else {
        customData[index].chef = {};
    }
}

function setCustomEquip(groupIndex, index, equipId) {
    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;
    if (equipId) {
        customData[index].equip = getEquipInfo(equipId, currentRule.equips);
    } else {
        customData[index].equip = {};
    }
}

function setCustomCondiment(groupIndex, index, condimentId, data) {
    var customData = calCustomRule.rules[groupIndex].custom;
    if (condimentId) {
        customData[index].condiment = getCondimentInfo(condimentId, data.condiments);
    } else {
        customData[index].condiment = {};
    }
}

function setCustomRecipe(groupIndex, chefIndex, recipeIndex, recipeId) {
    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;

    customData[chefIndex].recipes[recipeIndex] = {};

    var materialsData = JSON.parse(JSON.stringify(currentRule.materials));
    for (var m in customData) {
        for (var n in customData[m].recipes) {
            if (customData[m].recipes[n].data) {
                updateMaterialsData(materialsData, customData[m].recipes[n], customData[m].recipes[n].quantity);
            }
        }
    }

    if (recipeId) {
        for (var i in currentRule.menus) {
            if (currentRule.menus[i].recipe.data.recipeId == recipeId) {
                var quantity = getRecipeQuantity(currentRule.menus[i].recipe.data, materialsData, currentRule);

                var recipe = {};
                recipe["data"] = currentRule.menus[i].recipe.data;
                recipe["quantity"] = quantity;
                customData[chefIndex].recipes[recipeIndex] = recipe;

                break;
            }
        }
    }
}

function setCustomRecipeQuantity(groupIndex, chefIndex, recipeIndex, quantity) {
    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;

    customData[chefIndex].recipes[recipeIndex].quantity = quantity || 0;
}

function updateCustomRecipeCondiment(groupIndex, chefIndex, recipeIndex, useCondiment) {
    var chkCondiment = $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + chefIndex + ") .recipe-box:eq(" + recipeIndex + ") .recipe-condiment input");
    if (useCondiment) {
        chkCondiment.prop("checked", true);
    } else {
        chkCondiment.prop("checked", false);
    }
}

function calCustomResults(data) {
    var totalScore = 0;
    for (var groupIndex = 0; groupIndex < calCustomRule.rules.length; groupIndex++) {

        var currentRule = calCustomRule.rules[groupIndex];
        var customData = currentRule.custom;

        var partialChefAdds = getPartialChefAdds(customData, data.partialSkill, currentRule);

        for (var i in customData) {
            for (var j in customData[i].recipes) {
                if (customData[i].recipes[j].data) {
                    for (var m in currentRule.menus) {
                        if (currentRule.menus[m].recipe.data.recipeId == customData[i].recipes[j].data.recipeId) {
                            customData[i].recipes[j]["data"] = currentRule.menus[m].recipe.data;
                            customData[i].recipes[j]["max"] = currentRule.menus[m].recipe.max;
                            break;
                        }
                    }
                }
            }

            if (customData[i].chef.chefId) {
                setDataForChef(customData[i].chef, customData[i].equip, true, currentRule.calGlobalUltimateData, partialChefAdds[i], currentRule.calSelfUltimateData, currentRule.calActivityUltimateData, true, currentRule);
            }
        }

        var partialRecipeAdds = getPartialRecipeAdds(customData, data.partialSkill, currentRule);

        var intentAdds = getIntentAdds(groupIndex, customData, data, true);

        var price = 0;
        var bonus = 0;
        var score = 0;
        var time = 0;

        var scoreMultiply = 1;
        if (currentRule && currentRule.hasOwnProperty("scoreMultiply")) {
            scoreMultiply = currentRule.scoreMultiply;
        }

        var scorePow = 1;
        if (currentRule && currentRule.hasOwnProperty("scorePow")) {
            scorePow = currentRule.scorePow;
        }

        var scoreAdd = 0;
        if (currentRule.hasOwnProperty("scoreAdd")) {
            scoreAdd = currentRule.scoreAdd;
        }

        for (var i in customData) {
            for (var j in customData[i].recipes) {
                if (customData[i].recipes[j].data) {
                    var useCondiment = $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + i + ") .recipe-box:eq(" + j + ") .recipe-condiment input").prop("checked");
                    var resultData = getRecipeResult(customData[i].chef, customData[i].equip, customData[i].recipes[j].data,
                        customData[i].recipes[j].quantity, customData[i].recipes[j].max, currentRule.materials,
                        currentRule, currentRule.decorationEffect, useCondiment ? customData[i].condiment : null,
                        true, customData[i].recipes, partialRecipeAdds[i], intentAdds[i * 3 + Number(j)]);

                    customData[i].recipes[j] = resultData;
                    time += resultData.totalTime;
                    price += resultData.totalPrice;
                    bonus += resultData.totalBonusScore;

                    score += Math.ceil(+(resultData.totalScore * (1 + resultData.data.activityAddition / 100)).toFixed(2));

                    if (resultData.rankVal == 0) {
                        var skillDiff = getSkillDiff(customData[i].chef, customData[i].recipes[j].data, 1);
                        customData[i].recipes[j]["skillDiff"] = skillDiff.disp;
                    }
                }
            }
        }

        price = Math.ceil(+(Math.pow(price, scorePow) * scoreMultiply).toFixed(2));
        score = Math.ceil(+(Math.pow(score, scorePow) * scoreMultiply).toFixed(2));

        if (price) {
            price += scoreAdd;
            score += scoreAdd;
        }

        var materialsResult = checkMaterials(customData, currentRule.materials);
        for (var i in customData) {
            for (var j in customData[i].recipes) {
                if (customData[i].recipes[j].data) {
                    var available = getRecipeQuantity(customData[i].recipes[j].data, materialsResult.materials, currentRule);
                    var maxAvailable = customData[i].recipes[j].max - customData[i].recipes[j].quantity;
                    if (available > maxAvailable) {
                        available = maxAvailable;
                    }
                    customData[i].recipes[j]["available"] = available;
                    var recipeBox = $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + i + ") .recipe-box:eq(" + j + ") .recipe-quantity");
                    recipeBox.find("input").attr('max', customData[i].recipes[j].max).val(customData[i].recipes[j].quantity);
                    recipeBox.find(".max").html(customData[i].recipes[j].max);
                    if (currentRule.hasOwnProperty("MaterialsNum")) {
                        recipeBox.find(".available").html(available > 0 ? "(" + available + ")" : "");
                    } else {
                        recipeBox.find(".available").html("");
                    }
                }
            }
        }

        currentRule["rest"] = materialsResult.materials;
        updateCalMenus();

        for (var i in customData) {
            var chefContent = "";
            if (customData[i].chef.chefId) {
                chefContent = customData[i].chef.disp;
            } else {
                chefContent = "+ 厨师";
            }
            $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + i + ") .chef-box .content").html(chefContent);

            var equipContent = "";
            if (customData[i].equip.equipId) {
                equipContent = customData[i].equip.disp;
            } else {
                equipContent = "+ 厨具";
            }
            $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + i + ") .equip-box .content").html(equipContent);

            var condimentNum = 0;
            for (var j in customData[i].recipes) {
                var recipeBox = $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + i + ") .recipe-box:eq(" + j + ")");
                if (customData[i].recipes[j].data) {
                    var recipeData = customData[i].recipes[j];
                    recipeBox.find(".recipe-name").html(recipeData.data.name);

                    var exRecipeIds = $('#chk-cal-ex').val();
                    var chkEx = recipeBox.find(".recipe-ex input");
                    if (exRecipeIds.indexOf(customData[i].recipes[j].data.recipeId.toString()) >= 0) {
                        chkEx.prop("checked", true);
                    } else {
                        chkEx.prop("checked", false);
                    }

                    var result = "<div>" + recipeData.score + "*" + recipeData.quantity + "=<span class='score'>" + recipeData.totalScore + "</span></div>";
                    result += (recipeData.skillDiff ? "<div class='red'>" + recipeData.skillDiff + "</div>" : "");
                    if (currentRule.showTime) {
                        result += "<div>" + recipeData.totalTimeDisp + "</div>";
                    }
                    recipeBox.find(".recipe-result").html(result);

                    var content = "<div class='skill'>";
                    content += "<span>" + recipeData.data.condimentDisp + "</span>";
                    content += recipeData.data.skillDisp;
                    content += "</div>";
                    content += "<div class='material'>";
                    content += recipeData.data.calMaterialsDisp;
                    content += "</div>";
                    content += "<div class='rank'>" + (recipeData.rankDisp ? recipeData.rankDisp : "<span class='red'>—</span>") + (recipeData.rankAdditionDisp ? recipeData.rankAdditionDisp : "") + "</div>";
                    content += "<div class='add'>";
                    content += "<span>技能" + (recipeData.chefSkillAdditionDisp ? recipeData.chefSkillAdditionDisp : "") + "</span>";
                    content += "<span>厨具" + (recipeData.equipSkillAdditionDisp ? recipeData.equipSkillAdditionDisp : "") + "</span>";
                    if (!currentRule.hasOwnProperty("DisableCondimentEffect") || currentRule.DisableCondimentEffect == false) {
                        content += "<span>调料" + recipeData.condimentSkillAdditionDisp + "</span>";
                    }
                    content += "<span>规则" + recipeData.bonusAdditionDisp + "</span>";
                    content += "<span>修炼" + recipeData.data.ultimateAdditionDisp + "</span>";
                    if (!currentRule.hasOwnProperty("DisableDecorationEffect") || currentRule.DisableDecorationEffect == false) {
                        content += "<span>装饰" + recipeData.decorationAdditionDisp + "</span>";
                    }
                    else if (currentRule.calActivityUltimateData.length > 0) {
                        content += "<span>奇珍" + recipeData.data.activityAdditionDisp + "</span>";
                    }
                    content += "<span>基础";
                    content += recipeData.basicPercentDisp ? recipeData.basicPercentDisp : recipeData.basicAbsDisp;
                    content += "</span>";
                    if (recipeData.basicPercentDisp && recipeData.basicAbsDisp) {
                        content += "<span>" + recipeData.basicAbsDisp + "</span>"
                    }
                    content += "<span>在场" + recipeData.partialAdditionDisp + "</span>";
                    content += "</div>";

                    recipeBox.find(".recipe-box-2").html(content);

                    recipeBox.find(".recipe-placeholder").addClass("hidden");

                    if (recipeData.useCondiment) {
                        condimentNum += recipeData.data.rarity * recipeData.quantity;
                    }
                } else {
                    recipeBox.find(".recipe-placeholder").html("+ 菜谱").removeClass("hidden");;
                }
            }

            var condimentContent = "";
            if (customData[i].condiment.condimentId) {
                condimentContent = customData[i].condiment.calDisp;
                if (condimentNum) {
                    var index = condimentContent.indexOf("</small>");
                    condimentContent = condimentContent.substring(0, index) + "*" + condimentNum + condimentContent.substring(index, condimentContent.length);
                }
            } else {
                condimentContent = "+ 调料";
            }
            $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + i + ") .condiment-box .content").html(condimentContent);
        }

        var summary = "";
        if (calCustomRule.rules.length > 1) {
            summary += currentRule.Title + " ";
        }
        if (currentRule.Satiety) {
            $(".cal-custom-item:eq(" + groupIndex + ") .intent-satiety").addClass("label-default").removeClass("label-info");
            var satiety = calSatiety(customData, currentRule);

            summary += "饱腹：" + satiety.total + "/" + currentRule.Satiety;

            if (satiety.done) {
                if (currentRule.SatisfyRewardType == 1 && satiety.total == currentRule.Satiety) {
                    $(".cal-custom-item:eq(" + groupIndex + ") .intent-satiety").addClass("label-info").removeClass("label-default");
                }
                summary += " 加成：" + satiety.add + "%";
                score = calSatietyAdd(score, satiety.add);
            }
        } else {
            summary += "原售价：" + price;
        }

        if (currentRule.hasRuleAddition && !currentRule.hasOwnProperty("scoreMultiply")) {
            summary += " 规则分：" + bonus;
        }
        summary += " 总分：" + score;

        if (calCustomRule.rules.length > 1) {
            summary += " 合计：<span class='total-score'></span>";
        }
        totalScore += score;

        if (currentRule.showTime) {
            var timeAddition = 0;
            for (var i in customData) {
                if (customData[i].chef.chefId) {
                    if (!currentRule || !currentRule.hasOwnProperty("DisableChefSkillEffect") || currentRule.DisableChefSkillEffect == false) {
                        timeAddition += getTimeAddition(customData[i].chef.specialSkillEffect);
                    }
                    if (!currentRule || !currentRule.hasOwnProperty("DisableEquipSkillEffect") || currentRule.DisableEquipSkillEffect == false) {
                        if (customData[i].equip && customData[i].equip.effect) {
                            var equipEffect = updateEquipmentEffect(customData[i].equip.effect, customData[i].chef.selfUltimateEffect);
                            timeAddition += getTimeAddition(equipEffect);
                        }
                    }
                }
            }

            for (var i in partialRecipeAdds[0]) {
                var effect = partialRecipeAdds[0][i].effect;
                if (effect.type == "OpenTime") {
                    timeAddition += effect.value;
                }
            }

            if (+timeAddition.toFixed(2) != 0) {
                summary += " 原时间：" + (secondsToTime(time) || 0);
            }
            var finalTime = Math.ceil(+(time * (1 + timeAddition / 100)).toFixed(2));
            summary += " 总时间：" + (secondsToTime(finalTime) || 0);

            var finalEff = 0;
            if (finalTime > 0) {
                finalEff = Math.floor(score * 3600 / finalTime);
            }
            summary += " 总效率：" + finalEff + "金币/小时";
        }

        if (materialsResult.lackIds.length) {
            summary += " (" + materialsResult.message + ")";
            for (var i in materialsResult.lackIds) {
                $(".cal-custom-item:eq(" + groupIndex + ") .selected-item .recipe-box-2 .material span[data-id='" + materialsResult.lackIds[i] + "']").addClass("red");
            }
        }

        $(".cal-custom-item:eq(" + groupIndex + ") .selected-sum").html(summary);
    }

    if (calCustomRule.rules.length > 1) {
        $(".total-score").html(totalScore);
    }
    calCustomRule.score = totalScore;
}

function getIntentAdds(groupIndex, customData, data, update) {
    var currentRule = calCustomRule.rules[groupIndex];
    var intentAdds = [];
    if (currentRule.Satiety) {
        for (var i = 0; i < 9; i++) {
            intentAdds.push([]);
        }

        for (var i = 0; i < currentRule.IntentList.length; i++) {
            for (var j = 0; j < currentRule.IntentList[i].length; j++) {
                for (var k in data.intents) {
                    if (currentRule.IntentList[i][j] == data.intents[k].intentId) {

                        if (update) {
                            $(".cal-custom-item:eq(" + groupIndex + ") .intent-" + i + j).addClass("label-default").removeClass("label-info");
                        }

                        var valid = false;
                        var validIndex = 0;
                        var intent = data.intents[k];
                        if (intent.conditionType == "Group") {
                            valid = checkIntent(intent, customData[i].recipes, null, null);
                        } else {
                            for (var m in customData[i].recipes) {
                                if (customData[i].recipes[m].data) {
                                    valid = checkIntent(intent, customData[i].recipes, m, customData[i].chef);
                                    if (valid) {
                                        validIndex = Number(m);
                                        break;
                                    }
                                }
                            }
                        }

                        if (valid) {
                            if (update) {
                                $(".cal-custom-item:eq(" + groupIndex + ") .intent-" + i + j).addClass("label-info").removeClass("label-default");
                            }

                            if (intent.effectType == "CreateBuff") {
                                for (var m in data.buffs) {
                                    var buff = data.buffs[m];
                                    if (buff.buffId == intent.effectValue) {
                                        for (var n = 1; n <= buff.lastRounds; n++) {
                                            for (var o = 0; o < 3; o++) {
                                                if (checkIntent(buff, customData[n + i].recipes, o, customData[n + i].chef)) {
                                                    intentAdds[(n + i) * 3 + o].push(buff);
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            } else if (intent.effectType == "CreateIntent" && validIndex < 2) {
                                for (var m in data.intents) {
                                    if (data.intents[m].intentId == intent.effectValue) {
                                        if (checkIntent(data.intents[m], customData[i].recipes, validIndex + 1, customData[i].chef)) {
                                            intentAdds[i * 3 + validIndex + 1].push(data.intents[m]);
                                        }
                                        break;
                                    }
                                }
                            } else {
                                if (checkIntent(intent, customData[i].recipes, validIndex, customData[i].chef)) {
                                    intentAdds[i * 3 + validIndex].push(intent);
                                }
                            }
                        }

                        break;
                    }
                }
            }
        }
    }
    return intentAdds;
}

function checkIntent(intent, recipes, index, chef) {
    if (intent.conditionType == "Group") {
        var count = 0;
        for (var m in recipes) {
            var recipe = recipes[m].data;
            if (recipe) {
                if (recipe[intent.conditionValue.toLowerCase()] > 0) {
                    count++;
                }
            }
        }
        if (count == 3) {
            return true;
        }
    } else if (intent.conditionType == "ChefStar") {
        if (chef.chefId) {
            if (chef.rarity == intent.conditionValue) {
                return true;
            }
        }
    } else {
        var recipe = recipes[index].data;
        if (recipe) {
            if (intent.conditionType == "Rank") {
                if (chef.chefId) {
                    var rankData = getRankInfo(recipe, chef);
                    if (rankData.rankVal >= intent.conditionValue) {
                        return true;
                    }
                }
            } else if (intent.conditionType == "CondimentSkill" && recipe.condiment == intent.conditionValue
                || intent.conditionType == "CookSkill" && recipe[intent.conditionValue.toLowerCase()] > 0
                || intent.conditionType == "Rarity" && recipe.rarity == intent.conditionValue
                || intent.conditionType == "Order" && Number(index) + 1 == intent.conditionValue
                || !intent.conditionType) {
                return true;
            }
        }
    }
    return false;
}

function getSatietyPercent(satiety, rule) {
    if (rule.SatisfyRewardType == 1 && satiety == rule.Satiety) {
        return rule.SatisfyExtraValue;
    } else {
        return -rule.SatisfyDeductValue * Math.abs(satiety - rule.Satiety);
    }
}

function calSatiety(customData, rule) {
    var result = {};
    result["total"] = 0;
    result["add"] = 0;
    result["done"] = false;
    if (rule.Satiety) {
        var recipeNum = 0;
        for (var i in customData) {
            for (var j in customData[i].recipes) {
                if (customData[i].recipes[j].data) {
                    result.total += customData[i].recipes[j].satiety;
                    recipeNum++;
                }
            }
        }

        if (rule.GuestType == "Normal" && recipeNum == 3
            || rule.GuestType == "Boss" && recipeNum == 9) {
            result.done = true;
            result.add = getSatietyPercent(result.total, rule);
        }
    }
    return result;
}

function calSatietyAdd(score, satietyAdd) {
    return Math.ceil(+(score * (1 + satietyAdd * 0.01)).toFixed(2));
}

function getCustomChefsOptions(groupIndex, index, data) {
    var chkGot = $('#chk-cal-got').prop("checked");
    var useEquip = $("#chk-cal-use-equip").prop("checked");
    var show = $("#chk-cal-chef-show").val();

    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;

    var hasRecipe = false;
    for (var j in customData[index].recipes) {
        if (customData[index].recipes[j].data) {
            hasRecipe = true;
            break;
        }
    }

    var newData = JSON.parse(JSON.stringify(customData));

    var options = [];

    var chefs = JSON.parse(JSON.stringify(currentRule.chefs));

    for (var i in chefs) {

        if (chkGot && !chefs[i].got) {
            continue;
        }

        newData[index].chef = chefs[i];

        var option = {};
        option["display"] = chefs[i].name;
        option["value"] = chefs[i].chefId;
        option["content"] = "<span class='name'>" + chefs[i].name + "</span>";

        if (hasRecipe) {
            var partialChefAdds = getPartialChefAdds(newData, data.partialSkill, currentRule);

            if (useEquip) {
                newData[index].equip = chefs[i].equip;
            }

            for (var n in newData) {
                if (newData[n].chef.chefId) {
                    if (!currentRule.Satiety || n == index) {
                        setDataForChef(newData[n].chef, newData[n].equip, true, currentRule.calGlobalUltimateData,
                            partialChefAdds[n], currentRule.calSelfUltimateData,
                            currentRule.calActivityUltimateData, true, currentRule);
                    }
                }
            }

            var chef = JSON.parse(JSON.stringify(newData[index].chef));
            for (var j in newData[index].recipes) {
                if (newData[index].recipes[j].data) {
                    addCheffSkillDiff(chef, newData[index].recipes[j].data);
                }
            }

            var sDiff = getChefSillDiff(chef, newData[index].chef);
            if (sDiff != "") {
                option["content"] += "<span class='skill'>" + sDiff + "</span>";
                option["class"] = "warning-skill";
            }

            newData[index].chef = chef;

            var partialRecipeAdds = getPartialRecipeAdds(newData, data.partialSkill, currentRule);

            var intentAdds = getIntentAdds(groupIndex, newData, data, false);

            var score = 0;
            for (var n in newData) {
                for (var m in newData[n].recipes) {
                    if (newData[n].recipes[m].data) {
                        var resultData = getRecipeResult(newData[n].chef, newData[n].equip, newData[n].recipes[m].data,
                            newData[n].recipes[m].quantity, newData[n].recipes[m].max, currentRule.materials,
                            currentRule, currentRule.decorationEffect,
                            newData[n].recipes[m].useCondiment ? newData[n].condiment : null,
                            true, newData[n].recipes, partialRecipeAdds[n], intentAdds[n * 3 + Number(m)]);

                        newData[n].recipes[m] = resultData;
                        score += resultData.totalScore;
                    }
                }
            }

            var satiety = calSatiety(newData, currentRule);
            if (currentRule.Satiety) {
                score = calSatietyAdd(score, satiety.add);
            }

            option["content"] += "<span class='score'>" + score + "</span>";
            option["order"] = score;
        } else {
            option["order"] = chefs[i].rarity;
        }

        if (show.indexOf("rarity") >= 0) {
            option["content"] += "<span class='subtext'>" + chefs[i].rarityDisp + "</span>";
        }
        if (show.indexOf("specialSkill") >= 0) {
            option["content"] += "<span class='skilltext'>" + chefs[i].specialSkillDisp.replace(/<br>/g, " ") + "</span>";
        }
        if (show.indexOf("ultimate") >= 0) {
            option["content"] += "<span class='skilltext'>" + chefs[i].ultimateCustomDisp + "</span>";
        }
        if (show.indexOf("origin") >= 0) {
            option["content"] += "<span class='subtext'>" + chefs[i].origin.replace(/<br>/g, " ") + "</span>";
        }

        for (var r in calCustomRule.rules) {
            var custom = calCustomRule.rules[r].custom;
            for (var m in custom) {
                if (custom[m].chef.chefId == chefs[i].chefId) {
                    option["disabled"] = true;
                    break;
                }
            }
        }

        if (customData[index].chef.chefId == chefs[i].chefId) {
            option["selected"] = true;
        }

        options.push(option);
    }

    options.sort(function (a, b) {
        return b.order - a.order
    });

    var option = {};
    option["display"] = "选择厨师";
    option["value"] = "";
    option["class"] = "hidden"
    options.unshift(option);

    return options;
}

function getChefUltimateCustomDisp(skillId, skills) {
    var valid = false;
    if (skillId) {
        for (var k in skills) {
            if (skillId == skills[k].skillId) {
                for (var m in skills[k].effect) {
                    if (skills[k].effect[m].condition == "Partial") {
                        valid = true;
                        break;
                    } else if (skills[k].effect[m].condition == "Self") {
                        if (skills[k].effect[m].type != "Material_Gain") {
                            valid = true;
                            break;
                        }
                    } else if (skills[k].effect[m].condition == "Next") {
                        valid = true;
                        break;
                    }
                }
                break;
            }
        }
        if (valid) {
            var skillInfo = getSkillInfo(skills, skillId);
            return skillInfo.skillDisp.replace(/<br>/g, " ")
        }
    }
    return "";
}

function getCustomEquipsOptions(groupIndex, index, equips, data) {
    var show = $("#chk-cal-equip-show").val();

    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;

    var hasRecipe = false;
    for (var j in customData[index].recipes) {
        if (customData[index].recipes[j].data) {
            hasRecipe = true;
            break;
        }
    }

    var newData = JSON.parse(JSON.stringify(customData));

    var partialChefAdds = getPartialChefAdds(newData, data.partialSkill, currentRule);

    var options = [];

    for (var i in equips) {
        var skillDisp = equips[i].skillDisp.replace(/<br>/g, " ");

        var option = {};
        option["display"] = equips[i].name;
        option["value"] = equips[i].equipId;
        option["content"] = "<span class='name'>" + equips[i].name + "</span>";
        option["tokens"] = equips[i].name + skillDisp;

        if (newData[index].chef.chefId && hasRecipe) {
            newData[index].equip = equips[i];

            setDataForChef(newData[index].chef, newData[index].equip, true, currentRule.calGlobalUltimateData,
                partialChefAdds[index], currentRule.calSelfUltimateData,
                currentRule.calActivityUltimateData, true, currentRule);


            var chef = JSON.parse(JSON.stringify(newData[index].chef));
            for (var j in newData[index].recipes) {
                if (newData[index].recipes[j].data) {
                    addCheffSkillDiff(chef, newData[index].recipes[j].data);
                }
            }

            var sDiff = getChefSillDiff(chef, newData[index].chef);
            if (sDiff != "") {
                option["content"] += "<span class='skill'>" + sDiff + "</span>";
                option["class"] = "warning-skill";
            }

            newData[index].chef = chef;

            var partialRecipeAdds = getPartialRecipeAdds(newData, data.partialSkill, currentRule);

            var intentAdds = getIntentAdds(groupIndex, newData, data, false);

            var score = 0;
            for (var n in newData) {
                for (var m in newData[n].recipes) {
                    if (newData[n].recipes[m].data) {
                        var resultData = getRecipeResult(newData[n].chef, newData[n].equip, newData[n].recipes[m].data,
                            newData[n].recipes[m].quantity, newData[n].recipes[m].max, currentRule.materials,
                            currentRule, currentRule.decorationEffect,
                            newData[n].recipes[m].useCondiment ? newData[n].condiment : null,
                            true, newData[n].recipes, partialRecipeAdds[n], intentAdds[n * 3 + Number(m)]);

                        newData[n].recipes[m] = resultData;
                        score += resultData.totalScore;
                    }
                }
            }

            var satiety = calSatiety(newData, currentRule);
            if (currentRule.Satiety) {
                score = calSatietyAdd(score, satiety.add);
            }

            option["content"] += "<span class='score'>" + score + "</span>";
            option["order"] = score;
        }

        if (show.indexOf("rarity") >= 0) {
            option["content"] += "<span class='subtext'>" + equips[i].rarityDisp + "</span>";
        }
        if (show.indexOf("skill") >= 0) {
            option["content"] += "<span class='subtext'>" + skillDisp + "</span>";
        }
        if (show.indexOf("origin") >= 0) {
            option["content"] += "<span class='subtext'>" + equips[i].origin.replace(/<br>/g, " ") + "</span>";
        }

        if (customData[index].equip.equipId == equips[i].equipId) {
            option["selected"] = true;
        }

        options.push(option);
    }

    options.sort(function (a, b) {
        return b.order - a.order
    });

    var option = {};
    option["display"] = "无厨具";
    option["value"] = "";
    option["class"] = "hidden"
    options.unshift(option);

    return options;
}

function getCustomCondimentsOptions(groupIndex, index, condiments, data) {
    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;
    var useCondiment = false;
    for (var j in customData[index].recipes) {
        if (customData[index].recipes[j].useCondiment) {
            useCondiment = true;
            break;
        }
    }

    var newData = JSON.parse(JSON.stringify(customData));

    var partialRecipeAdds = getPartialRecipeAdds(newData, data.partialSkill, currentRule);

    var intentAdds = getIntentAdds(groupIndex, newData, data, false);

    var satiety = calSatiety(newData, currentRule);

    var options = [];

    for (var i in condiments) {
        var skillDisp = condiments[i].skillDisp.replace(/<br>/g, " ");

        var option = {};
        option["display"] = condiments[i].name;
        option["value"] = condiments[i].condimentId;
        option["content"] = "<span class='name'>" + condiments[i].name + "</span>";
        option["content"] += "<span class='subtext'>" + condiments[i].rarityDisp + "</span>";
        option["tokens"] = condiments[i].name + skillDisp;

        if (useCondiment) {
            newData[index].condiment = condiments[i];

            var score = 0;
            for (var n in newData) {
                for (var m in newData[n].recipes) {
                    if (newData[n].recipes[m].data) {
                        var resultData = getRecipeResult(newData[n].chef, newData[n].equip, newData[n].recipes[m].data,
                            newData[n].recipes[m].quantity, newData[n].recipes[m].max, currentRule.materials,
                            currentRule, currentRule.decorationEffect,
                            newData[n].recipes[m].useCondiment ? newData[n].condiment : null,
                            true, newData[n].recipes, partialRecipeAdds[n], intentAdds[n * 3 + Number(m)]);

                        newData[n].recipes[m] = resultData;
                        score += resultData.totalScore;
                    }
                }
            }

            if (currentRule.Satiety) {
                score = calSatietyAdd(score, satiety.add);
            }

            option["content"] += "<span class='score'>" + score + "</span>";
            option["order"] = score;
        }

        option["content"] += "<span class='subtext'>" + skillDisp + "</span>";

        if (customData[index].condiment.condimentId == condiments[i].condimentId) {
            option["selected"] = true;
        }

        options.push(option);
    }

    if (useCondiment) {
        options.sort(function (a, b) {
            return b.order - a.order
        });
    }

    var option = {};
    option["display"] = "无调料";
    option["value"] = "";
    option["class"] = "hidden"
    options.unshift(option);

    return options;
}

function getCustomRecipesOptions(groupIndex, chefIndex, recipeIndex, data) {
    var chkGot = $('#chk-cal-got').prop("checked");
    var chkRarity = $("#chk-cal-recipe-rarity").val();
    var chkSkill = $("#chk-cal-recipe-skill").val();
    var chkMultiple = $('#chk-cal-recipe-multiple-skill').prop("checked");
    var chkCondiment = $("#chk-cal-recipe-condiment").val();
    var order = $("#select-cal-order").val();
    var useCondiment = $(".cal-custom-item:eq(" + groupIndex + ") .selected-item:eq(" + chefIndex + ") .recipe-box:eq(" + recipeIndex + ") .recipe-condiment input").prop("checked");
    var show = $("#chk-cal-recipe-show").val();

    var currentRule = calCustomRule.rules[groupIndex];
    var customData = currentRule.custom;

    var newData = JSON.parse(JSON.stringify(customData));

    newData[chefIndex].recipes[recipeIndex] = {};

    var materialsData = JSON.parse(JSON.stringify(currentRule.materials));
    for (var m in newData) {
        for (var n in newData[m].recipes) {
            if (newData[m].recipes[n].data) {
                updateMaterialsData(materialsData, newData[m].recipes[n], newData[m].recipes[n].quantity);
            }
        }
    }

    var options = [];
    var menus = currentRule.menus;
    for (var j in menus) {

        var recipe = menus[j].recipe;

        if (chkGot && !recipe.data.got) {
            continue;
        }

        if (chkRarity.length > 0 && chkRarity.indexOf(recipe.data.rarity.toString()) < 0) {
            continue;
        }

        if (chkSkill.length > 0) {
            var pass = false;
            for (var k in chkSkill) {
                if (recipe.data["" + chkSkill[k] + ""] > 0) {
                    pass = true;
                    if (!chkMultiple) {
                        break;
                    }
                } else {
                    if (chkMultiple) {
                        pass = false;
                        break;
                    }
                }
            }
            if (!pass) {
                continue;
            }
        }

        if (chkCondiment.length > 0 && chkCondiment.indexOf(recipe.data.condiment) < 0) {
            continue;
        }

        var option = {};
        option["display"] = recipe.data.name;
        option["value"] = recipe.data.recipeId;
        option["content"] = "<span class='name'>" + recipe.data.name + "</span>";

        var quantity = getRecipeQuantity(recipe.data, materialsData, currentRule);

        newData[chefIndex].recipes[recipeIndex] = recipe;
        newData[chefIndex].recipes[recipeIndex]["useCondiment"] = useCondiment;
        newData[chefIndex].recipes[recipeIndex]["quantity"] = quantity;

        var partialRecipeAdds = getPartialRecipeAdds(newData, data.partialSkill, currentRule);

        var intentAdds = getIntentAdds(groupIndex, newData, data, false);

        var score = 0;
        var maxScore = recipe.totalScore;
        var efficiency = recipe.efficiency;
        var sDiff = "";
        for (var n in newData) {
            for (var m in newData[n].recipes) {
                if (newData[n].recipes[m].data) {
                    var resultData = getRecipeResult(newData[n].chef, newData[n].equip, newData[n].recipes[m].data,
                        newData[n].recipes[m].quantity, newData[n].recipes[m].max, currentRule.materials,
                        currentRule, currentRule.decorationEffect,
                        newData[n].recipes[m].useCondiment ? newData[n].condiment : null,
                        true, newData[n].recipes, partialRecipeAdds[n], intentAdds[n * 3 + Number(m)]);
                    score += resultData.totalScore;

                    if (n == chefIndex && m == recipeIndex) {
                        resultData = getRecipeResult(newData[n].chef, newData[n].equip, newData[n].recipes[m].data,
                            newData[n].recipes[m].max, newData[n].recipes[m].max, currentRule.materials,
                            currentRule, currentRule.decorationEffect,
                            newData[n].recipes[m].useCondiment ? newData[n].condiment : null,
                            true, newData[n].recipes, partialRecipeAdds[n], intentAdds[n * 3 + Number(m)]);
                        maxScore = resultData.totalScore;
                        efficiency = resultData.efficiency;
                        if (resultData.rankVal == 0) {
                            var skillDiff = getSkillDiff(newData[chefIndex].chef, recipe.data, 1);
                            sDiff = skillDiff.disp;
                        }
                    }

                    newData[n].recipes[m] = resultData;
                }
            }
        }

        var satiety = calSatiety(newData, currentRule);
        if (currentRule.Satiety) {
            score = calSatietyAdd(score, satiety.add);
        }

        for (var r in calCustomRule.rules) {
            var custom = calCustomRule.rules[r].custom;
            for (var m in custom) {
                for (var n in custom[m].recipes) {
                    if (custom[m].recipes[n].data) {
                        if (custom[m].recipes[n].data.recipeId == recipe.data.recipeId) {
                            if (r == groupIndex && m == chefIndex && n == recipeIndex) {
                                continue;
                            }
                            option["disabled"] = true;
                            score = 0;
                        }
                    }
                }
            }
        }

        option["class"] = "";
        if (sDiff != "") {
            option["content"] += "<span class='skill'>" + sDiff + "</span>";
            option["class"] += "warning-skill";
        }

        if (show.indexOf("rank") >= 0) {
            var rankDisp = newData[chefIndex].recipes[recipeIndex].rankDisp;
            if (rankDisp && rankDisp != "-") {
                option["content"] += "<span class='subtext'>" + rankDisp + "</span>";
            }
        }

        if (currentRule.hasOwnProperty("MaterialsNum")) {
            var avaScore = maxScore / recipe.max * quantity;
            if (quantity < recipe.max) {
                option["content"] += "<span class='available'>" + quantity + "/" + recipe.max
                    + " " + avaScore + "/" + maxScore + "</span><span class='total'>" + score + "</span>";
            } else {
                option["content"] += "<span class='subtext'>" + quantity + "/" + recipe.max
                    + " " + avaScore + "</span><span class='total'>" + score + "</span>";
            }
            option["order"] = score;
        } else {
            if (order == "分数") {
                option["content"] += "<span class='score'>" + maxScore + "</span><span class='total'>" + score + "</span>";
                option["order"] = score;
            } else if (order == "时间") {
                option["content"] += "<span class='score'>" + recipe.data.totalTimeDisp + "</span>";
                option["order"] = recipe.data.totalTime;
            } else if (order == "效率") {
                option["content"] += "<span class='score'>" + efficiency + "</span>";
                option["order"] = efficiency;
            }
        }

        if (show.indexOf("rarity") >= 0) {
            option["content"] += "<span class='subtext'>" + recipe.data.rarityDisp + "</span>";
        }
        if (show.indexOf("skill") >= 0) {
            option["content"] += "<span class='skilltext'>" + recipe.data.skillDisp + "</span>";
        }
        if (show.indexOf("condiment") >= 0) {
            option["content"] += "<span class='subtext'>" + recipe.data.condimentDisp + "</span>";
        }
        if (show.indexOf("material") >= 0) {
            option["content"] += "<span class='subtext'>" + recipe.data.materialsDisp.replace(/\*/g, "") + "</span>";
        }
        if (show.indexOf("origin") >= 0) {
            option["content"] += "<span class='subtext'>" + recipe.data.origin.replace(/<br>/g, " ") + "</span>";
        }

        if (customData[chefIndex].recipes[recipeIndex].data
            && customData[chefIndex].recipes[recipeIndex].data.recipeId == recipe.data.recipeId) {
            option["selected"] = true;
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

    return options;
}

function updateCalMenus() {
    var currentRule = calCustomRule.rules[0];
    var customData = currentRule.custom;
    for (var j in currentRule.menus) {
        var available = getRecipeQuantity(currentRule.menus[j].recipe.data, currentRule.rest, currentRule);

        for (var m in customData) {
            for (var n in customData[m].recipes) {
                if (customData[m].recipes[n].data && currentRule.menus[j].recipe.data.recipeId == customData[m].recipes[n].data.recipeId) {
                    var maxAvailable = currentRule.menus[j].recipe.max - customData[m].recipes[n].quantity;
                    if (available > maxAvailable) {
                        available = maxAvailable;
                    }
                }
            }
        }

        currentRule.menus[j].recipe.available = available;
        currentRule.menus[j].recipe.availableScore = Math.ceil(+(currentRule.menus[j].recipe.totalScore / currentRule.menus[j].recipe.max * available).toFixed(2));
    }
}

function calRecipesResults() {
    var table = $('#cal-recipes-table').DataTable();
    var menus = table.rows({ order: 'applied' }).data().toArray();
    var selects = table.rows({ selected: true }).data().toArray();

    updateCalMenus();

    table.clear().rows.add(menus);
    if ($("#chk-cal-results-lock-order").prop("checked")) {
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
    var orderColumn = 7;    // availableScore
    var value = $('#select-cal-order').val();
    if (value == "分数") {
        orderColumn = 7;      // availableScore
    } else if (value == "时间") {
        orderColumn = 9;     // totalTime
    } else if (value == "效率") {
        orderColumn = 10;     // efficiency
    }

    var exist = false;

    var table = $('#cal-recipes-table').DataTable();
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

function checkMaterials(customData, materials) {
    var materialsData = JSON.parse(JSON.stringify(materials));

    for (var i in customData) {
        for (var j in customData[i].recipes) {
            var recipe = customData[i].recipes[j];
            if (recipe.data) {
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
    }

    var lackIds = [];
    var message = "";
    for (var n in materialsData) {
        if (materialsData[n].quantity < 0) {
            lackIds.push(materialsData[n].materialId);
            message += materialsData[n].name + materialsData[n].quantity;
        }
    }

    return { "materials": materialsData, "lackIds": lackIds, "message": message };
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
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
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
            "className": "all",
            "orderSequence": ["desc", "asc"],
            "width": "38px"
        },
        {
            "data": {
                "_": "equipId",
                "display": "equipDisp"
            },
            "className": "cal-td-select-equip nodetails all",
            "width": "101px"
        }
    ];

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 3]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var calChefsTable = $('#cal-chefs-table').DataTable({
        data: [],
        columns: calChefsColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_",
            select: {
                rows: {
                    _: "选择了 %d 个厨师",
                    0: "选择了 %d 个厨师",
                    1: "选择了 %d 个厨师"
                }
            }
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        deferRender: false, // for select
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        createdRow: function (row, data, index) {
            $(row).addClass('rarity-' + data.rarity);
        },
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i < 2) {
                                continue;
                            } else if (i > 5 && i <= 10) {
                                continue;
                            } else if (i == 5) {
                                data += "<div class='col-lg-3 col-xs-6'>";
                                for (var j = 5; j <= 10; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }
                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#cal-chefs-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-chefs div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 名字 性别">');

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
        "columns": [16],  // equip
        "inputTypes": [
            {
                "column": 16,   // equip
                "type": "list",
                "search": true,
                "clear": true,
                "done": true,
                "options": options
            }
        ],
        "onUpdate": function (table, row, cell, oldValue) {
            if (cell.index().column == 16) {     // equipId
                var chef = row.data();
                var equip = null;
                var equipDisp = "";
                if (chef.equipId) {
                    for (var j in data.equips) {
                        if (chef.equipId == data.equips[j].equipId) {
                            equip = data.equips[j];
                            equipDisp = data.equips[j].disp;
                            break;
                        }
                    }
                }
                chef.equip = equip;
                chef.equipDisp = equipDisp;
                row.data(chef);
                calChefsTable.draw(false);
            }
        }
    });

    $('#chk-cal-chefs-show').on('changed.bs.select', function () {
        initCalChefsShow(calChefsTable);
    });

    $('.chk-cal-chefs-rarity input[type="checkbox"]').click(function () {
        var rarity = $(this).attr("data-rarity");
        if ($(this).prop("checked")) {
            calChefsTable.rows('.rarity-' + rarity, { search: 'applied' }).select();
        } else {
            calChefsTable.rows('.rarity-' + rarity).deselect();
        }
    });

    $("#btn-cal-chefs-equip-clear").click(function () {
        calChefsTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            var chef = this.data();
            chef.equip = null;
            chef.equipId = "";
            chef.equipDisp = "";
            this.data(chef);
        });
    });

    $('#pane-cal-chefs .search-box input').on('input', function () {
        calChefsTable.draw();
        changeInputStyle(this);
    });

    $('#btn-cal-chefs-select-all').click(function () {
        $('.chk-cal-chefs-rarity input[type="checkbox"]').prop("checked", true);
        calChefsTable.rows({ search: 'applied' }).select();
    });

    $('#btn-cal-chefs-deselect-all').click(function () {
        $('.chk-cal-chefs-rarity input[type="checkbox"]').prop("checked", false);
        calChefsTable.rows().deselect();
    });

    $('#btn-cal-chefs-export').click(function () {
        var selectedData = $('#cal-chefs-table').DataTable().rows({ selected: true }).data().toArray();
        var exportData = {};
        exportData["calChefs"] = [];
        for (var i in selectedData) {
            exportData.calChefs.push(selectedData[i].chefId);
        }
        $("#input-export-import").val(JSON.stringify(exportData));
    });

    initTableResponsiveDisplayEvent(calChefsTable);
    initTableScrollEvent("#pane-cal-chefs");

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
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
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

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 3]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var calEquipsTable = $('#cal-equips-table').DataTable({
        data: [],
        columns: calEquipsColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_",
            select: {
                rows: {
                    _: "选择了 %d 个厨具",
                    0: "选择了 %d 个厨具",
                    1: "选择了 %d 个厨具"
                }
            }
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [[5, "desc"]],  //origin
        deferRender: false, // for select
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        createdRow: function (row, data, index) {
            $(row).addClass('rarity-' + data.rarity);
        },
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i < 2) {
                                continue;
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }
                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#cal-equips-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-equips div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 名字 技能 来源">');

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

    $('#pane-cal-equips .search-box input').on('input', function () {
        calEquipsTable.draw();
        changeInputStyle(this);
    });

    $('#btn-cal-equips-select-all').click(function () {
        $('.chk-cal-equips-rarity input[type="checkbox"]').prop("checked", true);
        calEquipsTable.rows().select();
    });

    $('#btn-cal-equips-deselect-all').click(function () {
        $('.chk-cal-equips-rarity input[type="checkbox"]').prop("checked", false);
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

    initTableResponsiveDisplayEvent(calEquipsTable);
    initTableScrollEvent("#pane-cal-equips");

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
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
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
            "className": "all",
            "orderSequence": ["desc", "asc"],
            "width": "50px"
        },
        {
            "data": "addition",
            "className": "all",
            "orderSequence": ["desc", "asc"],
            "width": "50px"
        }
    ];

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 3]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var calMaterialsTable = $('#cal-materials-table').DataTable({
        data: [],
        columns: calMaterialsColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_",
            select: {
                rows: {
                    _: "选择了 %d 个食材",
                    0: "选择了 %d 个食材",
                    1: "选择了 %d 个食材"
                }
            }
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [[4, "desc"]],  //origin
        deferRender: false, // for select
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        createdRow: function (row, data, index) {
            $(row).addClass('origin-' + data.originVal);
        },
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i < 2) {
                                continue;
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 3 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }
                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#cal-materials-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-materials div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 名字 来源">');

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

    $('#pane-cal-materials .search-box input').on('input', function () {
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

    initTableResponsiveDisplayEvent(calMaterialsTable);
    initTableScrollEvent("#pane-cal-materials");

    initCalMaterialsShow(calMaterialsTable);
}

function initCalCustomTable(data) {

    var recipeCopy = $(".selected-item .recipe-box")[0].outerHTML;
    $(".selected-item").append(recipeCopy).append(recipeCopy);
    var itemCopy = $(".selected-item")[0].outerHTML;
    $(".selected-item-wrapper").append(itemCopy).append(itemCopy);
    var customCopy = $(".cal-custom-item")[0].outerHTML;
    $("#pane-cal-custom").append(customCopy).append(customCopy);

    $(".selected-item-wrapper .select-picker select").on('show.bs.select', function (e) {
        $(this).closest(".selected-box").addClass("editing");
        $("body").addClass("m-no-scroll");
    });

    $(".selected-item-wrapper .select-picker select").on('hide.bs.select', function (e) {
        $(this).closest(".selected-box").removeClass("editing");
        $("body").removeClass("m-no-scroll");
    });

    $(".chef-box").click(function () {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var index = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var chefsOptions = getCustomChefsOptions(groupIndex, index, data);
        $(this).find('select.select-picker-chef').html(getOptionsString(chefsOptions)).selectpicker('refresh').selectpicker('toggle');
    });

    $('select.select-picker-chef').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var index = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var chefId = $(this).val();

        setCustomChef(groupIndex, index, chefId);

        if ($("#chk-cal-use-equip").prop("checked")) {
            if (chefId) {
                var currentRule = calCustomRule.rules[groupIndex];
                for (var i in currentRule.chefs) {
                    if (currentRule.chefs[i].chefId == chefId) {
                        setCustomEquip(groupIndex, index, currentRule.chefs[i].equipId);
                        break;
                    }
                }
            }
        }

        calCustomResults(data);
    });

    $(".equip-box").click(function () {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var index = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var currentRule = calCustomRule.rules[groupIndex];
        var equipsOptions = getCustomEquipsOptions(groupIndex, index, currentRule.equips, data);
        $(this).find('select.select-picker-equip').html(getOptionsString(equipsOptions)).selectpicker('refresh').selectpicker('toggle');
    });

    $('select.select-picker-equip').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var index = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var equipId = $(this).val();

        setCustomEquip(groupIndex, index, equipId);
        calCustomResults(data);
    });

    $(".condiment-box").click(function () {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var index = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var condimentsOptions = getCustomCondimentsOptions(groupIndex, index, data.condiments, data);
        $(this).find('select.select-picker-condiment').html(getOptionsString(condimentsOptions)).selectpicker('refresh').selectpicker('toggle');
    });

    $('select.select-picker-condiment').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var index = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var condimentId = $(this).val();

        setCustomCondiment(groupIndex, index, condimentId, data);
        calCustomResults(data);
    });

    $(".recipe-box .recipe-placeholder, .recipe-box .recipe-name, .recipe-box .recipe-result, .recipe-box .recipe-box-2").click(function () {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var chefIndex = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var recipeIndex = $(this).closest(".selected-item").find(".recipe-box").index($(this).closest(".recipe-box"));
        var recipesOptions = getCustomRecipesOptions(groupIndex, chefIndex, recipeIndex, data);
        $(this).closest(".recipe-box").find('select.select-picker-recipe').html(getOptionsString(recipesOptions)).selectpicker('refresh').selectpicker('toggle');
    });

    $('select.select-picker-recipe').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var chefIndex = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var recipeIndex = $(this).closest(".selected-item").find(".recipe-box").index($(this).closest(".recipe-box"));
        var recipeId = $(this).val();

        setCustomRecipe(groupIndex, chefIndex, recipeIndex, recipeId);
        calCustomResults(data);

        var currentRule = calCustomRule.rules[groupIndex];
        if (currentRule.hasOwnProperty("MaterialsNum")) {
            $("#pane-cal-recipes").attr("data-cal", "false");
        }
    });

    $(".recipe-box .recipe-quantity").click(function () {
        $(this).find("input").focus();
    });

    $(".recipe-box .recipe-quantity input").on('input', function () {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var chefIndex = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var recipeIndex = $(this).closest(".selected-item").find(".recipe-box").index($(this).closest(".recipe-box"));
        var quantity = $(this).val();

        setCustomRecipeQuantity(groupIndex, chefIndex, recipeIndex, quantity);
        calCustomResults(data);

        var currentRule = calCustomRule.rules[groupIndex];
        if (currentRule.hasOwnProperty("MaterialsNum")) {
            $("#pane-cal-recipes").attr("data-cal", "false");
        }
    });

    $('.recipe-box .recipe-ex input').click(function () {
        var groupIndex = $(".cal-custom-item").index($(this).closest(".cal-custom-item"));
        var chefIndex = $(this).closest(".cal-custom-item").find(".selected-item").index($(this).closest(".selected-item"));
        var recipeIndex = $(this).closest(".selected-item").find(".recipe-box").index($(this).closest(".recipe-box"));

        var currentRule = calCustomRule.rules[groupIndex];
        var customData = currentRule.custom;

        var recipeId = customData[chefIndex].recipes[recipeIndex].data.recipeId.toString();
        var exRecipeIds = $('#chk-cal-ex').val();

        var index = exRecipeIds.indexOf(recipeId);
        if (index < 0) {
            exRecipeIds.push(recipeId);
        } else {
            exRecipeIds.splice(index, 1);
        }

        $('#chk-cal-ex').selectpicker('val', exRecipeIds);
    });

    $('.recipe-box .recipe-condiment input').click(function () {
        calCustomResults(data);
    });

    $('.btn-resize').click(function () {
        if ($(this).hasClass("glyphicon-resize-small")) {
            $(this).closest(".cal-custom-item").find(".rule-desc").hide();
            $(this).closest(".cal-custom-item").find(".selected-item-wrapper").hide();
            $(this).addClass("glyphicon-resize-full").removeClass("glyphicon-resize-small");
        } else {
            $(this).closest(".cal-custom-item").find(".rule-desc").show();
            $(this).closest(".cal-custom-item").find(".selected-item-wrapper").show();
            $(this).addClass("glyphicon-resize-small").removeClass("glyphicon-resize-full");
        }
    });

    if (private) {

        var calLocalData;
        try {
            var localData = localStorage.getItem('cal');
            calLocalData = JSON.parse(localData);
        } catch (e) { }

        if (!calLocalData) {
            calLocalData = [];
        }

        for (var i in calLocalData) {
            $('#select-cal-save').append("<option value='" + calLocalData[i].key + "'>" + calLocalData[i].key + "</option>").selectpicker('refresh');
        }

        var calOptimalWorker;
        var optimalMenu;

        $('.btn-cal-results-cal').click(function () {

            optimalMenu = [];

            var panel = $("#pane-cal-optimal-results");

            if (typeof (calOptimalWorker) != "undefined") {
                calOptimalWorker.terminate();
                calOptimalWorker = undefined;
            }

            $("#cal-save-result").addClass("hidden");
            $('#select-cal-save').selectpicker('val', "");

            if ($(this).hasClass("stop")) {
                panel.find(".cal-results-progress").addClass("hidden");
                panel.find(".btn-cal-results-cal.start").prop("disabled", false);
                panel.find(".btn-cal-results-cal.stop").prop("disabled", true);
                return;
            }

            panel.find(".optimal-result").html("");
            panel.find(".btn-cal-results-cal.start").prop("disabled", true);
            panel.find(".btn-cal-results-cal.stop").prop("disabled", false);
            panel.find(".cal-results-progress .progress-bar").css("width", "0%");
            panel.find(".cal-results-progress .progress-bar span").text("预处理中");
            panel.find(".cal-results-progress").removeClass("hidden");

            calOptimalWorker = new Worker("others/js/cal.js?v=" + (new Date()).getTime());

            calOptimalWorker.onmessage = function (event) {
                if (event.data.progress) {
                    panel.find(".cal-results-progress .progress-bar").css("width", event.data.progress.value + "%");
                    panel.find(".cal-results-progress .progress-bar span").text(event.data.progress.display);
                } else if (event.data.menu) {
                    optimalMenu = event.data.menu;
                    showCalOptimalResult(optimalMenu, data);
                } else if (event.data.done) {
                    panel.find(".btn-cal-results-cal.stop").prop("disabled", true);
                    panel.find(".btn-cal-results-cal.start").prop("disabled", false);
                    panel.find(".cal-results-progress").addClass("hidden");
                    if (optimalMenu.length) {
                        $("#cal-save-result").removeClass("hidden");
                    }
                } else if (event.data.error) {
                    bootbox.alert({
                        size: "small",
                        message: "<div class='text-center'>" + event.data.error + "</div>"
                    });
                }
            };

            var calRecipesData = $('#cal-recipes-table').DataTable().rows({ selected: true }).data().toArray();
            var calChefsData = $('#cal-chefs-table').DataTable().rows({ selected: true }).data().toArray();
            var calEquipsData = $('#cal-equips-table').DataTable().rows({ selected: true }).data().toArray();
            var calMaterialsData = $('#cal-materials-table').DataTable().rows({ selected: true }).data().toArray();
            var noEquips = $('#chk-cal-results-no-equips').prop("checked");
            var addEquips = $('#chk-cal-results-add-equips').prop("checked");
            var changeEquips = $('#chk-cal-results-change-equips').prop("checked");
            var filterEquipCondiment = $('#chk-cal-results-filter-equip-condiment').prop("checked");
            var useCondiment = $('#chk-cal-results-use-condiment').prop("checked");
            var minScore = Number($('#input-cal-min-score').val());
            var thread = Number($('#input-cal-thread').val());
            var mode = $('#select-cal-type').val();

            var currentRule = calCustomRule.rules[0];
            var customData = currentRule.custom;

            calOptimalWorker.postMessage({
                "mode": mode,
                "rule": currentRule,
                "custom": customData,
                "recipes": calRecipesData,
                "chefs": calChefsData,
                "equips": calEquipsData,
                "materials": calMaterialsData,
                "odata": data,
                "noEquips": noEquips,
                "addEquips": addEquips,
                "changeEquips": changeEquips,
                "filterEquipCondiment": filterEquipCondiment,
                "useCondiment": useCondiment,
                "minScore": minScore,
                "thread": thread
            });
        });

        $("#btn-cal-save").click(function () {
            var name = escapeHtml($("#input-cal-save-name").val());
            if (name.length) {
                $("#cal-save-result").addClass("hidden");
                $('#select-cal-save').append("<option value='" + name + "'>" + name + "</option>").selectpicker('refresh');
                $('#select-cal-save').selectpicker('val', name);

                var item = {};
                item["key"] = name;
                item["val"] = optimalMenu;
                calLocalData.push(item);
                try {
                    localStorage.setItem('cal', JSON.stringify(calLocalData));
                } catch (e) { }
                $("#input-cal-save-name").val("");
            } else {
                $("#input-cal-save-name").focus();
            }
        });

        $('#select-cal-save').change(function () {
            var key = $(this).val();
            for (var i in calLocalData) {
                if (calLocalData[i].key == key) {
                    optimalMenu = calLocalData[i].val;
                    showCalOptimalResult(optimalMenu, data);
                    $("#cal-save-result").addClass("hidden");
                    break;
                }
            }
        });

        $("#btn-cal-save-clear").click(function () {
            bootbox.confirm({
                size: "small",
                message: "<div class='text-center'>确定清空保存?</div>",
                locale: "zh_CN",
                callback: function (result) {
                    if (result) {
                        $('#select-cal-save').html("").append("<option></option>").selectpicker('refresh');
                        calLocalData = [];
                        try {
                            localStorage.setItem('cal', "");
                        } catch (e) { }
                    }
                }
            });
        });
    }
}

function showCalOptimalResult(optimalMenu, data) {
    var result = "<table class='table table-condensed'>";
    result += "<tr><td>厨师</td><td>厨具</td><td>调料</td><td>菜谱</td></tr>";

    for (var m in optimalMenu) {
        var menu = optimalMenu[m].menu;
        for (var i in menu) {
            result += "<tr>";
            result += "<td>" + menu[i].chef.name + "</td>";
            result += "<td>" + (menu[i].equip.name ? menu[i].equip.name : "") + "</td>";
            result += "<td>" + (menu[i].condiment.name ? menu[i].condiment.name : "") + "</td>";
            result += "<td>";
            for (var j in menu[i].recipes) {
                result += menu[i].recipes[j].data.name + "[" + menu[i].recipes[j].data.condimentDisp + "]" + "*" + menu[i].recipes[j].quantity + " ";
            }
            result += "</td>";
            result += "</tr>";
        }
        result += "<tr class='active'><td colspan='4'>";
        result += "分数: " + optimalMenu[m].score;
        result += "<button data-id='" + m + "' class='btn btn-default btn-sm btn-cal-set-custom' type='button'>选择当前菜谱</button></td><tr>";
        result += "</td></tr>";
    }

    result += "</table>";

    $("#pane-cal-optimal-results").find(".optimal-result").html(result);
    $('.btn-cal-set-custom').click(function () {
        var index = Number($(this).attr("data-id"));
        var result = JSON.parse(JSON.stringify(optimalMenu[index].menu));
        initCustomData();

        var groupIndex = 0;
        var currentRule = calCustomRule.rules[groupIndex];
        var customData = currentRule.custom;

        for (var i in result) {
            customData[i].chef = result[i].chef;
            customData[i].equip = result[i].equip;
            customData[i].condiment = result[i].condiment;
            for (var j in result[i].recipes) {
                customData[i].recipes[j] = result[i].recipes[j];
                updateCustomRecipeCondiment(groupIndex, i, j, customData[i].recipes[j].useCondiment);
            }
        }

        calCustomResults(data);
        if (currentRule.hasOwnProperty("MaterialsNum")) {
            $("#pane-cal-recipes").attr("data-cal", "false");
        }
    });
}

function initCalRecipesTable() {

    var calRecipesColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox nodetails all',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": undefined,
            "defaultContent": "<span class='glyphicon'></span>",
            "className": "td-expend",
            "orderable": false,
            "searchable": false,
            "visible": expendBtn,
            "width": "1px"
        },
        {
            "data": "recipe.data.galleryId",
            "width": "1px"
        },
        {
            "data": "recipe.data.icon",
            "className": "td-recipe-icon",
            "orderable": false,
            "searchable": false
        },
        {
            "data": "recipe.data.name",
            "width": "86px",
            "className": "all"
        },
        {
            "data": "recipe.available",
            "className": "all",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.max",
            "className": "all",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.availableScore",
            "className": "all",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.totalScore",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "recipe.totalTime",
                "display": "recipe.totalTimeDisp"
            }
        },
        {
            "data": "recipe.efficiency",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.bonusAdditionDisp",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.ultimateAdditionDisp",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.decorationAdditionDisp",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "recipe.data.rarity",
                "display": "recipe.data.rarityDisp"
            },
            "className": "rarity",
            "width": "50px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "recipe.data.condiment",
                "display": "recipe.data.condimentDisp"
            },
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.stirfry",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.boil",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.knife",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.fry",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.bake",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.steam",
            "width": "20px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "recipe.data.materialsVal",
                "display": "recipe.data.materialsDisp"
            }
        },
        {
            "data": {
                "_": "recipe.data.price",
                "display": "recipe.data.priceDisp"
            },
            "width": "30px",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "recipe.data.exPrice",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "recipe.data.time",
                "display": "recipe.data.timeDisp"
            }
        },
        {
            "data": "recipe.data.origin"
        },
        {
            "data": "recipe.data.tagsDisp",
            "defaultContent": "",
            "visible": private,
            "className": "none"
        }
    ];

    var fixedHeader = true;
    var scrollX = false;
    var fixedColumns = false;
    if (isMobile) {
        fixedHeader = false;
        scrollX = true;
        fixedColumns = {
            left: [0, 4]
        };
    }

    var target = 'td:not(.nodetails)';
    if (expendBtn) {
        target = '.td-expend';
    }

    var table = $('#cal-recipes-table').DataTable({
        data: [],
        columns: calRecipesColumns,
        language: {
            search: "查找:",
            zeroRecords: "没有找到",
            info: "_TOTAL_个",
            infoEmpty: "0",
            infoFiltered: "/ _MAX_",
            select: {
                rows: {
                    _: "选择了 %d 个菜谱",
                    0: "选择了 %d 个菜谱",
                    1: "选择了 %d 个菜谱"
                }
            }
        },
        pagingType: "numbers",
        pageLength: Number($("#select-setting-page-length").val()),
        dom: "<'table-top clearfix'<'left'i><'right'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        select: {
            style: 'multi',
            selector: 'td.select-checkbox'
        },
        order: [],
        deferRender: false, // for select
        autoWidth: false,
        fixedHeader: fixedHeader,
        scrollX: scrollX,
        fixedColumns: fixedColumns,
        responsive: {
            details: {
                type: 'column',
                target: target,
                renderer: function (api, rowIdx, columns) {
                    var data = "";
                    for (var i in columns) {
                        if (columns[i].hidden) {
                            if (i < 2) {
                                continue;
                            } else if (i > 16 && i <= 21) {
                                continue;
                            } else if (i == 16) {
                                data += "<div class='col-lg-3 col-xs-6'>";
                                for (var j = 16; j <= 21; j++) {
                                    if (columns[j].data) {
                                        data += "<span class='child-key'>" + columns[j].title + "</span>"
                                            + "<span class='child-value'>" + columns[j].data + "</span>"
                                    }
                                }
                                data += "</div>";
                            } else {
                                data += "<div class='col-lg-3 col-xs-6'>"
                                    + "<span class='child-key'>" + columns[i].title + (i < 4 ? "" : "：") + "</span>"
                                    + "<span class='child-value'>"
                                    + columns[i].data
                                    + "</span>"
                                    + "</div>";
                            }
                        }
                    }

                    return data ? "<div class='child-inner'" + getResponsiveStyle($('#cal-recipes-table')) + ">" + data + "</div>" : false;
                }
            }
        }
    });

    $("#pane-cal-recipes div.search-box").html('<input type="search" class="form-control input-sm monitor-none" placeholder="查找 菜名 材料">');
    $('#pane-cal-recipes .search-box input').on('input', function () {
        table.draw();
        changeInputStyle(this);
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('cal-recipes-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-recipes .search-box input").val());
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

    $('#btn-cal-recipes-select-all').click(function () {
        table.rows({ search: 'applied' }).select();
    });

    $('#btn-cal-recipes-deselect-all').click(function () {
        table.rows().deselect();
    });

    $('#chk-cal-recipes-show').on('changed.bs.select', function () {
        initCalRecipesShow(table);
    });

    initTableResponsiveDisplayEvent(table);
    initTableScrollEvent("#pane-cal-recipes");

    initCalRecipesShow(table);
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
        json.maps = json.maps.concat(json2.maps);
        json.buffs = json.buffs.concat(json2.buffs);
        json.intents = json.intents.concat(json2.intents);
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
        for (var j in json.skills[i].effect) {
            if (json.skills[i].effect[j].condition == "Partial" || json.skills[i].effect[j].condition == "Next") {
                partialSkill.push(json.skills[i]);
                break;
            }
        }
    }
    retData["partialSkill"] = partialSkill;

    retData["rules"] = json.rules;

    retData["intents"] = json.intents;

    retData["buffs"] = json.buffs;

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

    var condimentsData = [];
    for (var i in json.condiments) {
        var condiment = json.condiments[i];
        condiment["rarityDisp"] = getRarityDisp(json.condiments[i].rarity);
        var skillInfo = getSkillInfo(json.skills, json.condiments[i].skill);
        condiment["skillDisp"] = skillInfo.skillDisp;
        condiment["skillSort"] = 0;
        condiment["effect"] = skillInfo.skillEffect;
        condiment["icon"] = "<div class='icon-condiment condiment_" + json.condiments[i].condimentId + "'></div>";
        condiment["calDisp"] = "<span class='name'>" + json.condiments[i].name + "<small> " + condiment.rarityDisp + "</small></span><br><small>" + skillInfo.skillDisp + "</small>";
        condimentsData.push(condiment);
    }
    retData["condiments"] = condimentsData;

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
        equip["disp"] = "<span class='name'>" + json.equips[i].name + "</span><br><small>" + skillInfo.skillDisp + "</small>";

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
            decoration["tAvgEff"] = +((decoration.tipMin + decoration.tipMax) / 2 * 3600 * 24 / decoration.tipTime).toFixed(1);

            if (decoration.tipTime / 3600 % 24 >= 20) {
                var day = Math.ceil(decoration.tipTime / 3600 / 24);
                decoration["rAvgEff"] = +((decoration.tipMin + decoration.tipMax) / 2 / day).toFixed(1);
            }

            decoration["avgEffDisp"] = getDecorationAvgEffDisp(decoration.tAvgEff, decoration.rAvgEff);
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

    var showFinal = person && person.setting && person.setting.final;

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
        chefData["ultimateGoalDisp"] = ultimateGoalDisp;

        var ultimateSkillInfo = getSkillInfo(json.skills, json.chefs[i].ultimateSkill);
        chefData["ultimateSkillDisp"] = ultimateSkillInfo.skillDisp;
        chefData["ultimateSkillEffect"] = ultimateSkillInfo.skillEffect;

        chefData["ultimateCustomDisp"] = getChefUltimateCustomDisp(json.chefs[i].ultimateSkill, json.skills);

        chefData["got"] = "";
        chefData["ultimate"] = "";
        chefData["equip"] = null;
        chefData["equipId"] = "";
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
                                chefData["equipId"] = equipsData[k].equipId;
                                chefData["equipDisp"] = equipsData[k].disp;
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }

        setDataForChef(chefData, chefData.equip, useEquip, ultimateData.global, null, ultimateData.self, null, showFinal, null);

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
        recipeData["rankSort"] = 1;
        recipeData["ex"] = "";
        recipeData["got"] = "";

        if (person) {
            for (var j in person.recipes) {
                if (json.recipes[i].recipeId == person.recipes[j].id) {
                    if (person.recipes[j].hasOwnProperty("rank")) {
                        recipeData["rank"] = person.recipes[j].rank;
                        recipeData["rankSort"] = getRankSortValue(person.recipes[j].rank);
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
        setDataForRecipe(recipeData, ultimateData.global, useEx, null, showFinal, null);

        recipeData["efficiency"] = Math.floor(json.recipes[i].price * 3600 / json.recipes[i].time);

        var materialsInfo = getMaterialsInfo(json.recipes[i], json.materials);
        recipeData["materialsVal"] = materialsInfo.materialsVal;
        recipeData["materialsDisp"] = materialsInfo.materialsDisp;
        recipeData["calMaterialsDisp"] = materialsInfo.calMaterialsDisp;
        recipeData["veg"] = materialsInfo.veg;
        recipeData["meat"] = materialsInfo.meat;
        recipeData["creation"] = materialsInfo.creation;
        recipeData["fish"] = materialsInfo.fish;

        var materialsEff = 0;
        var condimentEff = 0;
        if (json.recipes[i].time > 0) {
            materialsEff = materialsInfo.materialsCount * 3600 / json.recipes[i].time;
            condimentEff = json.recipes[i].rarity * 3600 / json.recipes[i].time;
        }
        recipeData["allMaterialsEff"] = materialsEff ? Math.floor(materialsEff) : "";
        recipeData["condimentEff"] = condimentEff ? Math.floor(condimentEff) : "";

        var comboVal = "";
        var comboDisp = "-"
        for (var m in json.combos) {
            for (var n in json.combos[m].recipes) {
                if (json.combos[m].recipes[n] == json.recipes[i].recipeId) {
                    for (var o in json.recipes) {
                        if (json.recipes[o].recipeId == json.combos[m].recipeId) {
                            comboVal = json.recipes[o].recipeId;
                            comboDisp = json.recipes[o].name;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        recipeData["comboVal"] = comboVal;
        recipeData["comboDisp"] = comboDisp;

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
        recipeData["condimentDisp"] = getCondimentDisp(json.recipes[i].condiment);

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

    var person = getLocalData();

    var showFinal = $("#chk-setting-show-final").prop("checked");

    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var usePerson = $("#chk-chef-apply-ultimate-person").prop("checked");
    var ultimateData = getUltimateData(data.chefs, person, data.skills, useUltimate, usePerson);

    data.ultimateData = ultimateData;

    var partialChefIds = $('#chk-chef-partial-ultimate').val();
    var partialChefAdds = getPartialChefAddsByIds(data.chefs, data.partialSkill, useUltimate, partialChefIds);

    for (var i in data.chefs) {
        setDataForChef(data.chefs[i], data.chefs[i].equip, useEquip, ultimateData.global, partialChefAdds, ultimateData.self, null, showFinal, null);
    }

    for (var i in data.recipes) {
        var useEx = ifUseEx(data.recipes[i]);
        setDataForRecipe(data.recipes[i], ultimateData.global, useEx, null, showFinal, null);
    }

    updateRecipesChefsData(data);
    updateChefsRecipesData(data);

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
    var calMaterialsDisp = "";
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
                calMaterialsDisp += "<span data-id='" + materials[m].materialId + "'>" + materials[m].name + recipe.materials[k].quantity + "</span>";
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
    materialsInfo["calMaterialsDisp"] = calMaterialsDisp;
    materialsInfo["materialsVal"] = materialsVal;
    materialsInfo["materialsCount"] = materialsCount;
    materialsInfo["veg"] = veg;
    materialsInfo["meat"] = meat;
    materialsInfo["creation"] = creation;
    materialsInfo["fish"] = fish;
    return materialsInfo;
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
    var time4 = exTime / 3;
    var result = "可-" + Math.ceil(exTime / time) + "-" + secondsToTime(exTime)
        + "<br>优-" + Math.ceil(time1 / time) + "-" + secondsToTime(time1)
        + "<br>特-" + Math.ceil(time2 / time) + "-" + secondsToTime(time2)
        + "<br>神-" + Math.ceil(time3 / time) + "-" + secondsToTime(time3)
        + "<br>传-" + Math.ceil(time4 / time) + "-" + secondsToTime(time4);
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

function getRankSortValue(rank) {
    if (rank == "传") {
        return 5;
    } else if (rank == "神") {
        return 4;
    } else if (rank == "特") {
        return 3;
    } else if (rank == "优") {
        return 2;
    } else {
        return 1;
    }
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
            || rank == "神"
            || rank == "传") {
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

    if ((rank == "神" || rank == "传") && mark) {
        rankGiftDisp = "<span class='rank-done'>" + rankGiftDisp + "</span>";
    }

    if (!filter || filter && rank != "神" && rank != "传") {
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
                            if (skills[k].effect[m].condition == "Partial" || skills[k].effect[m].condition == "Next") {
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
                        if (skills[k].effect[m].condition == "Partial" || skills[k].effect[m].condition == "Next") {
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
            if (partialArray[i].skill.skillEffect[j].condition == "Partial"
                && (partialArray[i].skill.skillEffect[j].type == "Bake"
                    || partialArray[i].skill.skillEffect[j].type == "Steam"
                    || partialArray[i].skill.skillEffect[j].type == "Boil"
                    || partialArray[i].skill.skillEffect[j].type == "Fry"
                    || partialArray[i].skill.skillEffect[j].type == "Knife"
                    || partialArray[i].skill.skillEffect[j].type == "Stirfry")) {
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
                            if (skills[k].effect[m].type != "Material_Gain"
                                && skills[k].effect[m].type != "GuestDropCount"
                                && skills[k].effect[m].type != "GuestApearRate") {
                                var skillInfo = getSkillInfo(skills, skills[k].skillId);
                                var option = "<option value='" + chefs[i].chefId + "' data-subtext='" + skillInfo.skillDisp.replace(/<br>/g, " ") + "'>" + chefs[i].name + "</option>";
                                $('#chk-cal-self-ultimate').append(option);
                                break;
                            }
                        }
                    }
                    break;
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

function setDataForRecipe(recipeData, ultimateData, useEx, activityData, showFinal, rule) {
    recipeData["limitVal"] = recipeData.limit;
    recipeData["ultimateAddition"] = 0;

    if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
        for (var i in ultimateData) {
            if (ultimateData[i].type == "MaxEquipLimit" && ultimateData[i].rarity == recipeData.rarity) {
                recipeData.limitVal += ultimateData[i].value;
            }
        }

        recipeData.ultimateAddition = getRecipeAddition(ultimateData, null, null, recipeData, null, rule).price;
    }

    for (var i in activityData) {
        if (activityData[i].type == "MaxEquipLimit" && activityData[i].rarity == recipeData.rarity) {
            recipeData.limitVal += activityData[i].value;
        }
    }

    recipeData["limitDisp"] = getAtrributeDisp(recipeData.limitVal, recipeData.limit, showFinal);

    recipeData["ultimateAdditionDisp"] = getPercentDisp(recipeData.ultimateAddition);

    recipeData["activityAddition"] = getRecipeAddition(activityData, null, null, recipeData, null, rule).price;

    recipeData["activityAdditionDisp"] = getPercentDisp(recipeData.activityAddition);

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
    option = {};
    option["display"] = "传";
    option["value"] = "传";
    list.push(option);

    return list;
}

function getCondimentDisp(condiment) {
    if (condiment == "Sweet") {
        return "甜";
    }
    else if (condiment == "Sour") {
        return "酸";
    }
    else if (condiment == "Spicy") {
        return "辣";
    }
    else if (condiment == "Salty") {
        return "咸";
    }
    else if (condiment == "Bitter") {
        return "苦";
    }
    else if (condiment == "Tasty") {
        return "鲜";
    }
    else {
        return "";
    }
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
        var skillDisp = equips[i].skillDisp.replace(/<br>/g, " ");
        var option = {};
        option["display"] = equips[i].name;
        option["subtext"] = skillDisp;
        option["tokens"] = equips[i].name + skillDisp;
        option["value"] = equips[i].equipId;
        list.push(option);
    }
    return list;
}

function getOptionsString(options) {
    var result = "";
    $.each(options, function (index, option) {
        result = result + "<option value='" + option.value + "'";
        if (option.tokens) {
            result += " data-tokens='" + option.tokens + "'";
        }
        if (option.subtext) {
            result += " data-subtext='" + option.subtext + "'";
        }
        if (option.content) {
            result += " data-content=\"" + option.content + "\"";
        }
        if (option.class) {
            result += " class='" + option.class + "'";
        }
        if (option.disabled) {
            result += " disabled";
        }
        if (option.selected) {
            result += " selected";
        }
        result += ">" + option.display + "</option>"
    });
    return result;
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
        disp += "<span>炒" + recipe.stirfry + "</span>";
    }
    if (recipe.boil) {
        disp += "<span>煮" + recipe.boil + "</span>";
    }
    if (recipe.knife) {
        disp += "<span>切" + recipe.knife + "</span>";
    }
    if (recipe.fry) {
        disp += "<span>炸" + recipe.fry + "</span>";
    }
    if (recipe.bake) {
        disp += "<span>烤" + recipe.bake + "</span>";
    }
    if (recipe.steam) {
        disp += "<span>蒸" + recipe.steam + "</span>";
    }
    return disp;
}

function getDecorationAvgEffDisp(theory, reality) {
    var disp = "(理论)" + +(theory).toFixed(1);
    if (reality) {
        disp += " (实际)" + +(reality).toFixed(1);
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
    $('select.monitor-none').on('changed.bs.select', function () {
        changeSelectStyle(this);
    });

    $('input[type=text].monitor-none, input[type=number].monitor-none').on('input', function () {
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
    $('input[type=text].monitor-none, input[type=number].monitor-none').each(function () {
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
        $(table.column(column).header()).removeClass("all never").addClass("none");
    }
}

function resetExpendColumn(table, select) {
    var selectVal = $(select).val();
    var options = select + " option";
    var expendVal = $(options + ":first").val();
    var index = selectVal.indexOf(expendVal);
    if (index >= 0) {
        selectVal.splice(index, 1);
    }
    if (selectVal.length == $(options).length - 1) {
        changeTableHeaderClass(table, Number(expendVal), false);
    }
}

function initRecipeShow() {
    var recipeTable = $('#recipe-table').DataTable();

    $("#chk-recipe-show option").each(function () {
        changeTableHeaderClass(recipeTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-recipe-show option[value=5]').is(':selected');   // skill
    for (var i = 6; i <= 10; i++) {
        changeTableHeaderClass(recipeTable, i, chkSkill);
    }

    resetExpendColumn(recipeTable, "#chk-recipe-show");

    recipeTable.responsive.rebuild();
    recipeTable.responsive.recalc();
    recipeTable.columns.adjust().draw(false);
}

function initChefShow() {
    var chefTable = $('#chef-table').DataTable();

    $("#chk-chef-show option").each(function () {
        changeTableHeaderClass(chefTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-chef-show option[value=5]').is(':selected');     // skill
    for (var i = 6; i <= 10; i++) {
        changeTableHeaderClass(chefTable, i, chkSkill);
    }

    var chkExplore = $('#chk-chef-show option[value=12]').is(':selected');  // explore
    for (var i = 13; i <= 15; i++) {
        changeTableHeaderClass(chefTable, i, chkExplore);
    }

    var chkExplore = $('#chk-chef-show option[value=17]').is(':selected');  // condiment
    for (var i = 18; i <= 22; i++) {
        changeTableHeaderClass(chefTable, i, chkExplore);
    }

    resetExpendColumn(chefTable, "#chk-chef-show");

    chefTable.responsive.rebuild();
    chefTable.responsive.recalc();
    chefTable.columns.adjust().draw(false);
}

function initEquipShow() {
    var equipTable = $('#equip-table').DataTable();

    $("#chk-equip-show option").each(function () {
        changeTableHeaderClass(equipTable, Number($(this).val()), this.selected);
    });

    resetExpendColumn(equipTable, "#chk-equip-show");

    equipTable.responsive.rebuild();
    equipTable.responsive.recalc();
    equipTable.columns.adjust().draw(false);
}

function initCondimentShow() {
    var condimentTable = $('#condiment-table').DataTable();

    $("#chk-condiment-show option").each(function () {
        changeTableHeaderClass(condimentTable, Number($(this).val()), this.selected);
    });

    resetExpendColumn(condimentTable, "#chk-condiment-show");

    condimentTable.responsive.rebuild();
    condimentTable.responsive.recalc();
    condimentTable.columns.adjust().draw(false);
}

function initDecorationShow() {
    var decorationTable = $('#decoration-table').DataTable();

    $("#chk-decoration-show option").each(function () {
        changeTableHeaderClass(decorationTable, Number($(this).val()), this.selected);
    });

    resetExpendColumn(decorationTable, "#chk-decoration-show");

    decorationTable.responsive.rebuild();
    decorationTable.responsive.recalc();
    decorationTable.columns.adjust().draw(false);
}

function initQuestShow(questTable) {
    questTable.column(1).visible($('#select-quest-type').val() == "旧支线任务", false);
    questTable.columns.adjust().draw(false);
}

function initCalChefsShow(calChefsTable) {

    $("#chk-cal-chefs-show option").each(function () {
        changeTableHeaderClass(calChefsTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-cal-chefs-show option[value=5]').is(':selected');
    for (var i = 6; i <= 10; i++) {
        changeTableHeaderClass(calChefsTable, i, chkSkill);
    }

    resetExpendColumn(calChefsTable, "#chk-cal-chefs-show");

    calChefsTable.responsive.rebuild();
    calChefsTable.responsive.recalc();
    calChefsTable.columns.adjust().draw(false);
}

function initCalEquipsShow(calEquipsTable) {

    $("#chk-cal-equips-show option").each(function () {
        changeTableHeaderClass(calEquipsTable, Number($(this).val()), this.selected);
    });

    resetExpendColumn(calEquipsTable, "#chk-cal-equips-show");

    calEquipsTable.responsive.rebuild();
    calEquipsTable.responsive.recalc();
    calEquipsTable.columns.adjust().draw(false);
}

function initCalMaterialsShow(calMaterialsTable) {

    $("#chk-cal-materials-show option").each(function () {
        changeTableHeaderClass(calMaterialsTable, Number($(this).val()), this.selected);
    });

    resetExpendColumn(calMaterialsTable, "#chk-cal-materials-show");

    calMaterialsTable.responsive.rebuild();
    calMaterialsTable.responsive.recalc();
    calMaterialsTable.columns.adjust().draw(false);
}

function initCalRecipesShow(calRecipesTable) {

    $("#chk-cal-recipes-show option").each(function () {
        changeTableHeaderClass(calRecipesTable, Number($(this).val()), this.selected);
    });

    var chkSkill = $('#chk-cal-recipes-show option[value=16]').is(':selected'); // skill
    for (var i = 17; i <= 21; i++) {
        changeTableHeaderClass(calRecipesTable, i, chkSkill);
    }

    resetExpendColumn(calRecipesTable, "#chk-cal-recipes-show");

    if (!private) {
        calRecipesTable.column(0).visible(false, false);     // select
    }

    var currentRule = calCustomRule.rules[0];

    if (currentRule && currentRule.hasOwnProperty("MaterialsNum")) {
        calRecipesTable.column(5).visible(true, false);   // available
    } else {
        calRecipesTable.column(5).visible(false, false);   // available
    }

    if (currentRule && currentRule.showTime) {
        calRecipesTable.column(9).visible(true, false);   // total time
    }

    if (currentRule && currentRule.showEff) {
        calRecipesTable.column(10).visible(true, false);   // efficiency
    }

    calRecipesTable.responsive.rebuild();
    calRecipesTable.responsive.recalc();
    calRecipesTable.columns.adjust().draw(false);
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
                if (isMobile) {
                    updateScrollHeight();
                }
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
        $(table.body()).off("click", "td");
        table = null;
    }

    if (table != null) {
        // On cell click
        $(table.body()).on('click', 'td', function (event) {
            if ($(this).hasClass("child") || $(this).hasClass("dataTables_empty")) {
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
                    // Input CSS
                    var input = getInputHtml(currentRowIndex, currentColumnIndex, settings, oldValue, event);
                    $(cell).html($(cell).html() + input.html);
                    if (input.type == "input") {
                        $(cell).find("input").select().focus().on('focusout', function () {
                            $(this).updateEditableCell(this, settings);
                        });
                    } else if (input.type == "list") {
                        $(table.cells().nodes()).removeClass("editing");
                        $(cell).addClass("editing");

                        $(cell).find("select").selectpicker('hide').on('hidden.bs.select', function (e) {
                            $(this).updateEditableCell(this, settings);
                            $(cell).removeClass("editing");
                        });

                        $(cell).find("select").on('show.bs.select', function (e) {
                            var menu = $(cell).find(".dropdown-menu");
                            var menuWidth = menu.outerWidth();
                            var xPosition = event.clientX;
                            if (menu.hasClass("dropdown-menu-right")) {
                                var move = menuWidth - xPosition;
                                if (move > 0) {
                                    xPosition = xPosition + move;
                                    $(cell).find(".table-select-picker").css("left", xPosition);
                                }
                            } else {
                                var move = menuWidth - $(window).width() + xPosition;
                                if (move > 0) {
                                    xPosition = xPosition - move;
                                    $(cell).find(".table-select-picker").css("left", xPosition);
                                }
                            }
                        });

                        setTimeout(function () {
                            $(cell).find("select").selectpicker('show').selectpicker('toggle');
                        }, 0);
                    }
                }
            }
        });
    }

});

function getInputHtml(currentRowIndex, currentColumnIndex, settings, oldValue, event) {
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

            var actionsBox = " ";
            if (inputSetting.clear) {
                actionsBox = " data-actions-box='true' data-deselect-all-text='清空'";
            }

            if (inputSetting.done) {
                actionsBox += " data-done-button='true' data-done-button-text='关闭'";
            }

            input.html = "<div class='table-select-picker' style='left:" + event.clientX + "px;top:" + event.clientY + "px'><select " + searchable + actionsBox + " data-width='fit' data-dropdown-align-right='auto' data-live-search-placeholder='查找' data-none-results-text='没有找到' data-none-selected-text=''>";

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
            input.html = input.html + "</select></div>";
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

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}