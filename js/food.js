$(function () {
    $.ajax({
        cache: false,
        success: function (json) {
            init(json);
        },
        url: 'data/data.min.json'
    });
});

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

var private = false, cal = false, currentRule;
function initFunction() {
    var a = getParameterByName('a');
    if (a && lcode(a) == "cb8f8a72f7e4924a75cb75a4a59c0b8d61e70c0cb84f84edf7ede4c8") {
        private = true;
        cal = true;
    }

    var c = getParameterByName('c');
    if (c && lcode(c) == "519526da9fa86daa1536b8e280527306eda91dec4a0c56e2c9f64444") {
        cal = true;
    }

    if (private) {
        $('head').append('<link rel="stylesheet" type="text/css" href="others/css/image.css">');
    }
}

function initTables(data, person) {

    updateMenu(person);

    setPartialUltimateOptions(data.chefs, data.skills);

    initRecipeTable(data);

    initChefTable(data);

    initEquipTable(data);

    initDecorationTable(data);

    initMaterialTable(data);

    initQuestTable(data);

    initImportExport(data);

    initCalTables(data);

    if (cal) {
        $('#chk-recipe-show-tags').parent(".btn").removeClass('hidden');
        $('#chk-chef-show-tags').parent(".btn").removeClass('hidden');
    }

    $.fn.dataTable.ext.order['dom-selected'] = function (settings, col) {
        return this.api().column(col, { order: 'index' }).nodes().map(function (td, i) {
            return $(td).parent("tr").hasClass("selected") ? '1' : '0';
        });
    }

    initInfo(data);

    initVersionTip(person);

    initTooltip(person);

    $('.main-nav a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        reInitFixedHeader();
    });

    $('.loading').addClass("hidden");
    $('.main-function').removeClass("hidden");

    reInitFixedHeader();
}

function reInitFixedHeader() {
    $('#recipe-table').DataTable().fixedHeader.adjust();
    $('#chef-table').DataTable().fixedHeader.adjust();
    $('#equip-table').DataTable().fixedHeader.adjust();
    $('#decoration-table').DataTable().fixedHeader.adjust();
    $('#quest-table').DataTable().fixedHeader.adjust();
}

function initTooltip(person) {
    if (person && person["help"] == false) {
        $('#chk-show-help').bootstrapToggle('off');
    }

    $('.tooltip-pin[data-toggle="tooltip"]').tooltip(
        {
            animation: false,
            delay: { "show": 0, "hide": 0 },
            trigger: "hover"
        }
    );

    $('#chk-show-help').change(function () {
        updateLocalData("help", $(this).prop("checked"));
        updateTooltip();
    });

    updateTooltip();
}

function updateTooltip() {
    if ($("#chk-show-help").prop("checked")) {
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

function initRecipeTable(data) {

    reInitRecipeTable(data);

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var chkRarity1 = $('#chk-recipe-rarity-1').prop("checked");
        var chkRarity2 = $('#chk-recipe-rarity-2').prop("checked");
        var chkRarity3 = $('#chk-recipe-rarity-3').prop("checked");
        var chkRarity4 = $('#chk-recipe-rarity-4').prop("checked");
        var chkRarity5 = $('#chk-recipe-rarity-5').prop("checked");
        var rarity = Math.floor(data[3]) || 0;  // rarity

        if (chkRarity1 && rarity == 1
            || chkRarity2 && rarity == 2
            || chkRarity3 && rarity == 3
            || chkRarity4 && rarity == 4
            || chkRarity5 && rarity == 5) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        // skill
        if ($('#chk-recipe-skill-stirfry').prop("checked") && (Math.floor(data[4]) || 0) > 0
            || $('#chk-recipe-skill-boil').prop("checked") && (Math.floor(data[5]) || 0) > 0
            || $('#chk-recipe-skill-knife').prop("checked") && (Math.floor(data[6]) || 0) > 0
            || $('#chk-recipe-skill-fry').prop("checked") && (Math.floor(data[7]) || 0) > 0
            || $('#chk-recipe-skill-bake').prop("checked") && (Math.floor(data[8]) || 0) > 0
            || $('#chk-recipe-skill-steam').prop("checked") && (Math.floor(data[9]) || 0) > 0
        ) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        if ($('#chk-recipe-category-veg').prop("checked") && rowData.veg
            || $('#chk-recipe-category-meat').prop("checked") && rowData.meat
            || $('#chk-recipe-category-creation').prop("checked") && rowData.creation
            || $('#chk-recipe-category-fish').prop("checked") && rowData.fish) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var min = Math.floor($('#input-recipe-price').val());
        var price = Math.floor(data[11]) || 0;  // price

        if ($('#input-recipe-price').val() == "" || min < price) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-guest').prop("checked");
        var guest = data[24];   // guest

        if (!check || check && guest) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-no-origin').prop("checked");
        var origin = data[20];   // origin

        if (check || !check && origin) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-combo').prop("checked");
        var combo = data[22];   // combo

        if (!check || check && combo) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var value = $.trim($("#input-recipe-guest-antique").val());
        var searchCols = [25, 26];  // rank guest, rank antique

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var ex = data[28];   // ex
        if ($('#chk-recipe-ex-yes').prop("checked") && ex
            || $('#chk-recipe-ex-no').prop("checked") && !ex) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var check = $('#chk-recipe-got').prop("checked");
        var got = data[29];   // got

        if (!check || check && got) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var value = $.trim($("#pane-recipes .search-box input").val());
        var searchCols = [0, 2, 10, 20, 23, 24]; // id, name, materials, origin, tags, guest

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (searchCols[i] == 0) {  // id
                if (data[searchCols[i]] == value) {
                    return true;
                }
            } else if (searchCols[i] == 20) {  // origin
                if (data[searchCols[i]].indexOf(value) !== -1 && data[searchCols[i]].indexOf("神级") == -1) {
                    return true;
                }
            } else {
                if (data[searchCols[i]].indexOf(value) !== -1) {
                    return true;
                }
            }
        }

        return false;
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('recipe-table')) {
            return true;
        }

        var chkMaterials = $('#chk-recipe-show-material').val();
        if (chkMaterials.length > 0) {
            for (var i in chkMaterials) {
                for (var j in rowData.materials) {
                    if (rowData.materials[j].material == chkMaterials[i]) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            return true;
        }
    });

    for (var j in data.materials) {
        $('#chk-recipe-show-material').append("<option value='" + data.materials[j].materialId + "'>" + data.materials[j].name + "</option>");
    }

    for (var j in data.chefs) {
        $('#chk-recipe-show-chef').append("<option value='" + data.chefs[j].chefId + "'>" + data.chefs[j].name + "</option>");
    }

    $('#chk-recipe-show-material').selectpicker().on('changed.bs.select', function () {
        updateRecipesMaterialsData(data);
        reInitRecipeTable(data);
        initRecipeShow();
    });

    $('#chk-recipe-show-chef').selectpicker().on('changed.bs.select', function () {
        updateRecipesChefsData(data);
        reInitRecipeTable(data);
        initRecipeShow();
    });

    $('#chk-recipe-show-skill-diff').click(function () {
        if ($('#chk-recipe-show-chef').val().length) {
            updateRecipesChefsData(data);
            reInitRecipeTable(data);
            initRecipeShow();
        }
    });

    $('.chk-recipe-show').click(function () {
        initRecipeShow();
        updateMenuLocalData();
    });

    $('#chk-recipe-show-all').click(function () {
        if ($('.btn:not(.hidden) .chk-recipe-show:checked').length == $('.btn:not(.hidden) .chk-recipe-show').length) {
            $('.btn:not(.hidden) .chk-recipe-show').prop("checked", false);
        }
        else {
            $('.btn:not(.hidden) .chk-recipe-show').prop("checked", true);
        }
        initRecipeShow();
        updateMenuLocalData();
    });

    $('.chk-recipe-rarity input[type="checkbox"]').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('.chk-recipe-skill').click(function () {
        if ($(this).prop("checked")) {
            if ($('#chk-recipe-single-skill').prop("checked")) {
                $(".chk-recipe-skill").not(this).prop("checked", false);
            }
        }

        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-single-skill').change(function () {
        if ($(this).prop("checked")) {
            if ($('.chk-recipe-skill:checked').length > 1) {
                $('.chk-recipe-skill').prop("checked", false);
                $('#recipe-table').DataTable().draw();
            }
        }
    });

    $('#chk-recipe-skill-all').click(function () {
        if ($('#chk-recipe-single-skill').prop("checked")) {
            $('#chk-recipe-single-skill').bootstrapToggle('off');
        }
        $(".chk-recipe-skill").prop("checked", true);
        $('#recipe-table').DataTable().draw();
    });

    $('.chk-recipe-category input[type="checkbox"]').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#input-recipe-price').keyup(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#input-recipe-guest-antique').keyup(function () {
        if (!$('#chk-recipe-show-rank-guest').prop("checked")) {
            $('#chk-recipe-show-rank-guest').prop("checked", true);
            initRecipeShow();
        }
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-guest').click(function () {
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

    $('#chk-recipe-combo').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-ex-yes, #chk-recipe-ex-no').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-got').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-no-origin').click(function () {
        $('#recipe-table').DataTable().draw();
    });

    $('#btn-recipe-reset').click(function () {
        $('.chk-recipe-rarity input[type="checkbox"]').prop("checked", true);
        if ($('#chk-recipe-single-skill').prop("checked")) {
            $('#chk-recipe-single-skill').bootstrapToggle('off');
        }
        $(".chk-recipe-skill").prop("checked", true);
        $('.chk-recipe-category input[type="checkbox"]').prop("checked", true);
        $("#chk-recipe-guest").prop("checked", false);
        $("#chk-recipe-combo").prop("checked", false);
        $("#chk-recipe-ex-yes, #chk-recipe-ex-no").prop("checked", true);
        $("#chk-recipe-got").prop("checked", false);
        $('#input-recipe-price').val("");
        $('#input-recipe-guest-antique').val("");
        $('#chk-recipe-show-material').selectpicker("deselectAll");
        $('#recipe-table').DataTable().draw();
    });

    $('#chk-recipe-show-final').change(function () {
        updateRecipeChefTable(data);
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

    if (private) {
        $('#chk-recipe-show-ex-time').closest(".btn").removeClass('hidden');
        $('#chk-recipe-no-origin').closest(".box").removeClass('hidden');
    }

    initRecipeShow();
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
            "data": "name"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "stirfry",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "boil",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "knife",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "fry",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "bake",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "steam",
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
            }
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
            "data": "combo"
        },
        {
            "data": "tagsDisp",
            "defaultContent": ""
        },
        {
            "data": "guestsDisp"
        },
        {
            "data": {
                "_": "rankGuestsVal",
                "display": "rankGuestsDisp"
            }
        },
        {
            "data": "gift"
        },
        {
            "data": "rank",
            "width": "31px"
        },
        {
            "data": "ex",
            "width": "31px"
        },
        {
            "data": "got",
            "width": "31px"
        }
    ];

    var pageLength = 20;
    var searchValue = "";
    var order = [];

    if ($.fn.DataTable.isDataTable('#recipe-table')) {
        // pageLength = $("#pane-recipes #recipe-table_length select").val();
        searchValue = $("#pane-recipes .search-box input").val();
        order = getTableOrder($('#recipe-table').DataTable(), recipeColumns.length);
        $('#recipe-table').DataTable().MakeCellsEditable("destroy");
        $('#recipe-table').DataTable().destroy();
    };

    $('#recipe-table').html($('#recipe-table-header').html());

    var chkMaterials = $('#chk-recipe-show-material').val();
    for (var i in chkMaterials) {
        for (j in data.materials) {
            if (chkMaterials[i] == data.materials[j].materialId) {
                $('#recipe-table thead tr').append("<th>" + data.materials[j].name + "/小时</th>");
                recipeColumns.push({
                    "data": "materialsEff." + i,
                    "orderSequence": ["desc", "asc"]
                });
                break;
            }
        }
    }

    var chkSkillDiff = $('#chk-recipe-show-skill-diff').prop("checked");
    var chkChefs = $('#chk-recipe-show-chef').val();
    for (var i in chkChefs) {
        for (j in data.chefs) {
            if (chkChefs[i] == data.chefs[j].chefId) {
                $('#recipe-table thead tr').append("<th>" + data.chefs[j].name + "</th>");
                if (chkSkillDiff) {
                    $('#recipe-table thead tr').append("<th>神差值</th>");
                }
                $('#recipe-table thead tr').append("<th>效率</th>");
                recipeColumns.push({
                    "data": {
                        "_": "chefs." + i + ".rankVal",
                        "display": "chefs." + i + ".rankDisp"
                    },
                    "orderSequence": ["desc", "asc"]
                });
                if (chkSkillDiff) {
                    recipeColumns.push({
                        "data": {
                            "_": "chefs." + i + ".skillDiffVal",
                            "display": "chefs." + i + ".skillDiffDisp"
                        }
                    });
                }
                recipeColumns.push({
                    "data": "chefs." + i + ".efficiency",
                    "orderSequence": ["desc", "asc"]
                });
                break;
            }
        }
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
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "所有"]],
        pageLength: pageLength,
        dom: "<'row'<'col-sm-4'l><'col-sm-4 text-center'i><'col-sm-4'<'search-box'>>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12'p>>",
        deferRender: true,
        order: order,
        autoWidth: false,
        fixedHeader: true
    });

    $("#pane-recipes div.search-box").html('<label data-toggle="tooltip" title="该搜索不含升阶贵客和神级符文">查找:<input type="search" value="' + searchValue + '" class="form-control input-sm" placeholder="菜名 材料 贵客 符文 来源"></label>');

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
            var recipe = row.data();
            var rankGuestInfo = getRankGuestInfo(recipe, recipe.rank);
            recipe.rankGuestsVal = rankGuestInfo.rankGuestsVal;
            recipe.rankGuestsDisp = rankGuestInfo.rankGuestsDisp;
            $(table.cell(row.index(), 25).node()).html(recipe.rankGuestsDisp);  // rank guest
            if (cell.index().column == 28 && cell.data() != oldValue) {   // ex
                $("#btn-recipe-recal").closest(".box").removeClass("hidden");
            }
            updateRecipesLocalData();
        }
    });

    $('#pane-recipes .search-box input').keyup(function () {
        recipeTable.draw();
    });

    updateTooltip();
}

function updateRecipesMaterialsData(data) {
    var chkMaterials = $('#chk-recipe-show-material').val();
    if (chkMaterials.length > 0) {
        for (var i in data.recipes) {
            data.recipes[i]["materialsEff"] = [];
            for (var c in chkMaterials) {
                for (var j in data.materials) {
                    if (chkMaterials[c] == data.materials[j].materialId) {
                        var mNum = 0;
                        for (var k in data.recipes[i].materials) {
                            if (data.recipes[i].materials[k].material == data.materials[j].materialId) {
                                mNum = data.recipes[i].materials[k].quantity;
                                break;
                            }
                        }

                        var mEfficiency = 0;
                        if (data.recipes[i].time > 0) {
                            mEfficiency = mNum * 3600 / data.recipes[i].time;
                        }
                        var effDisp = mEfficiency ? Math.floor(mEfficiency) : "";
                        data.recipes[i]["materialsEff"].push(effDisp);
                        break;
                    }
                }
            }
        }
    }
}

function updateRecipesChefsData(data) {
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var chkSkillDiff = $('#chk-recipe-show-skill-diff').prop("checked");
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

                        if (chkSkillDiff) {
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

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var chkRarity1 = $('#chk-chef-rarity-1').prop("checked");
        var chkRarity2 = $('#chk-chef-rarity-2').prop("checked");
        var chkRarity3 = $('#chk-chef-rarity-3').prop("checked");
        var chkRarity4 = $('#chk-chef-rarity-4').prop("checked");
        var chkRarity5 = $('#chk-chef-rarity-5').prop("checked");
        var rarity = Math.floor(data[3]) || 0;  // rarity

        if (chkRarity1 && rarity == 1
            || chkRarity2 && rarity == 2
            || chkRarity3 && rarity == 3
            || chkRarity4 && rarity == 4
            || chkRarity5 && rarity == 5) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        // skill
        var stirfryMin = isNumeric($('#input-chef-stirfry').val()) ? $('#input-chef-stirfry').val() : Number.NEGATIVE_INFINITY;
        var stirfry = Math.floor(data[4]) || 0;
        var boilMin = isNumeric($('#input-chef-boil').val()) ? $('#input-chef-boil').val() : Number.NEGATIVE_INFINITY;
        var boil = Math.floor(data[5]) || 0;
        var knifeMin = isNumeric($('#input-chef-knife').val()) ? $('#input-chef-knife').val() : Number.NEGATIVE_INFINITY;
        var knife = Math.floor(data[6]) || 0;
        var fryMin = isNumeric($('#input-chef-fry').val()) ? $('#input-chef-fry').val() : Number.NEGATIVE_INFINITY;
        var fry = Math.floor(data[7]) || 0;
        var bakeMin = isNumeric($('#input-chef-bake').val()) ? $('#input-chef-bake').val() : Number.NEGATIVE_INFINITY;
        var bake = Math.floor(data[8]) || 0;
        var steamMin = isNumeric($('#input-chef-steam').val()) ? $('#input-chef-steam').val() : Number.NEGATIVE_INFINITY;
        var steam = Math.floor(data[9]) || 0;

        if (stirfryMin <= stirfry && boilMin <= boil && knifeMin <= knife && fryMin <= fry && bakeMin <= bake && steamMin <= steam) {
            return true;
        } else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var chkMale = $('#chk-chef-gender-male').prop("checked");
        var chkFemale = $('#chk-chef-gender-female').prop("checked");
        var gender = data[15];  // gender

        if (chkMale && gender == "男" || chkFemale && gender == "女" || chkMale && chkFemale) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var check = $('#chk-chef-no-origin').prop("checked");
        var origin = data[16];   // origin

        if (check || !check && origin) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var check = $('#chk-chef-got').prop("checked");
        var got = data[22];   // got

        if (!check || check && got) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('chef-table')) {
            return true;
        }

        var value = $.trim($("#pane-chefs .search-box input").val());
        var searchCols = [2, 10, 16, 17, 20];    //  name, skill, origin, tags, ultimateskill

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $('#chk-chef-show-recipe').selectpicker().on('changed.bs.select', function () {
        updateChefsRecipesData(data);
        reInitChefTable(data);
        initChefShow();
    });

    $('#chk-chef-show-skill-diff').click(function () {
        if ($('#chk-chef-show-recipe').val().length) {
            updateChefsRecipesData(data);
            reInitChefTable(data);
            initChefShow();
        }
    });

    $('.chk-chef-show').click(function () {
        initChefShow();
        updateMenuLocalData();
    });

    $('#chk-chef-show-all').click(function () {
        if ($('.chk-chef-show:checked').length == $('.chk-chef-show').length) {
            $('.chk-chef-show').prop("checked", false);
        }
        else {
            $('.chk-chef-show').prop("checked", true);
        }
        initChefShow();
        updateMenuLocalData();
    });

    $('.chk-chef-rarity input[type="checkbox"]').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('.input-chef-skill').keyup(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#btn-chef-skill-clear').click(function () {
        $('.input-chef-skill').val("");
        $('#chef-table').DataTable().draw();
    });

    $('.chk-chef-gender input[type="checkbox"]').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-got').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-no-origin').click(function () {
        $('#chef-table').DataTable().draw();
    });

    $('#chk-chef-show-final').change(function () {
        updateRecipeChefTable(data);
    });

    $('#chk-chef-apply-ultimate').change(function () {
        if ($(this).prop("checked")) {
            $('.chef-apply-ultimate').show();
            if ($('#chk-chef-partial-ultimate').val().length) {
                $(".partial-warning").removeClass("hidden");
            } else {
                $(".partial-warning").addClass("hidden");
            }
        } else {
            $('.chef-apply-ultimate').hide();
            $(".partial-warning").addClass("hidden");
        }
        updateRecipeChefTable(data);
    });

    $('#chk-chef-apply-ultimate-person').change(function () {
        updateRecipeChefTable(data);
    });

    $('#chk-chef-partial-ultimate').selectpicker().on('changed.bs.select', function () {
        if ($(this).val().length) {
            $(".partial-warning").removeClass("hidden");
        } else {
            $(".partial-warning").addClass("hidden");
        }
        updateRecipeChefTable(data);
    });

    $('#chk-chef-apply-equips').change(function () {
        updateRecipeChefTable(data);
    });

    $('#btn-chef-recal').click(function () {
        updateRecipeChefTable(data);
    });

    if (private) {
        $('#chk-chef-no-origin').closest(".box").removeClass('hidden');
    }

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
            "data": "name"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "stirfryVal",
                "display": "stirfryDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "boilVal",
                "display": "boilDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "knifeVal",
                "display": "knifeDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "fryVal",
                "display": "fryDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "bakeVal",
                "display": "bakeDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "steamVal",
                "display": "steamDisp"
            },
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
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "creationVal",
                "display": "creationDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "vegVal",
                "display": "vegDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "fishVal",
                "display": "fishDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "gender"
        },
        {
            "data": "origin"
        },
        {
            "data": "tagsDisp",
            "defaultContent": ""
        },
        {
            "data": {
                "_": "equipName",
                "display": "equipDisp"
            }
        },
        {
            "data": "ultimateGoal"
        },
        {
            "data": "ultimateSkillDisp"
        },
        {
            "data": "ultimate",
            "width": "31px"
        },
        {
            "data": "got",
            "width": "31px"
        }
    ];

    var pageLength = 20;
    var searchValue = "";
    var order = [];

    if ($.fn.DataTable.isDataTable('#chef-table')) {
        // pageLength = $("#pane-chefs #chef-table_length select").val();
        searchValue = $("#pane-chefs .search-box input").val();
        order = getTableOrder($('#chef-table').DataTable(), chefColumns.length);
        $('#chef-table').DataTable().MakeCellsEditable("destroy");
        $('#chef-table').DataTable().destroy();
    };

    $('#chef-table').html($('#chef-table-header').html());

    var chkSkillDiff = $('#chk-chef-show-skill-diff').prop("checked");
    var chkRecipes = $('#chk-chef-show-recipe').val();
    for (var i in chkRecipes) {
        for (var j in data.recipes) {
            if (chkRecipes[i] == data.recipes[j].recipeId) {
                $('#chef-table thead tr').append("<th title='" + data.recipes[j].skillDisp + "'>" + data.recipes[j].name + "</th>");
                if (chkSkillDiff) {
                    $('#chef-table thead tr').append("<th>神差值</th>");
                }
                $('#chef-table thead tr').append("<th>效率</th>");

                chefColumns.push({
                    "data": {
                        "_": "recipes." + i + ".rankVal",
                        "display": "recipes." + i + ".rankDisp"
                    },
                    "orderSequence": ["desc", "asc"]
                });
                if (chkSkillDiff) {
                    chefColumns.push({
                        "data": {
                            "_": "recipes." + i + ".skillDiffVal",
                            "display": "recipes." + i + ".skillDiffDisp"
                        }
                    });
                }
                chefColumns.push({
                    "data": "recipes." + i + ".efficiency",
                    "orderSequence": ["desc", "asc"]
                });
                break;
            }
        }
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
        fixedHeader: true
    });

    $("#pane-chefs div.search-box").html('<label>查找:<input type="search" value="' + searchValue + '" class="form-control input-sm" placeholder="名字 技能 来源"></label>');

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
                $(cell.node()).html(equipDisp);
            }
            if ((cell.index().column == 18 || cell.index().column == 21) && cell.data() != oldValue) {   // equipName, ultimate
                $("#btn-chef-recal").closest(".box").removeClass("hidden");
            }
            updateChefsLocalData();
        }
    });

    $('#pane-chefs .search-box input').keyup(function () {
        chefTable.draw();
    });
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
            "data": "name"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "skillDisp"
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
        fixedHeader: true
    });

    $("#pane-equips div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="名字 技能 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var skill = rowData.skillFilter;

        if ($('#chk-equip-skill-stirfry-price').prop("checked") && skill.indexOf("UseStirfry") >= 0
            || $('#chk-equip-skill-boil-price').prop("checked") && skill.indexOf("UseBoil") >= 0
            || $('#chk-equip-skill-knife-price').prop("checked") && skill.indexOf("UseKnife") >= 0
            || $('#chk-equip-skill-fry-price').prop("checked") && skill.indexOf("UseFry") >= 0
            || $('#chk-equip-skill-bake-price').prop("checked") && skill.indexOf("UseBake") >= 0
            || $('#chk-equip-skill-steam-price').prop("checked") && skill.indexOf("UseSteam") >= 0
            || $('#chk-equip-skill-meat-price').prop("checked") && skill.indexOf("UseMeat") >= 0
            || $('#chk-equip-skill-creation-price').prop("checked") && skill.indexOf("UseCreation") >= 0
            || $('#chk-equip-skill-veg-price').prop("checked") && skill.indexOf("UseVegetable") >= 0
            || $('#chk-equip-skill-fish-price').prop("checked") && skill.indexOf("UseFish") >= 0
            || $('#chk-equip-skill-sell-price').prop("checked") && (skill.indexOf("Gold_Gain") >= 0)
            || $('#chk-equip-skill-stirfry-skill').prop("checked") && skill.indexOf("Stirfry") >= 0
            || $('#chk-equip-skill-boil-skill').prop("checked") && skill.indexOf("Boil") >= 0
            || $('#chk-equip-skill-knife-skill').prop("checked") && skill.indexOf("Knife") >= 0
            || $('#chk-equip-skill-fry-skill').prop("checked") && skill.indexOf("Fry") >= 0
            || $('#chk-equip-skill-bake-skill').prop("checked") && skill.indexOf("Bake") >= 0
            || $('#chk-equip-skill-steam-skill').prop("checked") && skill.indexOf("Steam") >= 0
            || $('#chk-equip-skill-all-skill').prop("checked") &&
            skill.indexOf("Stirfry") >= 0 && skill.indexOf("Boil") >= 0 &&
            skill.indexOf("Knife") >= 0 && skill.indexOf("Fry") >= 0 &&
            skill.indexOf("Bake") >= 0 && skill.indexOf("Steam") >= 0
            || $('#chk-equip-skill-guest').prop("checked") && skill.indexOf("GuestApearRate") >= 0
            || $('#chk-equip-skill-time').prop("checked") && skill.indexOf("OpenTime") >= 0
            || $('#chk-equip-skill-material-get').prop("checked") && skill.indexOf("Material_Gain") >= 0
            || $('#chk-equip-skill-meat-skill').prop("checked") && skill.indexOf("Meat") >= 0
            || $('#chk-equip-skill-creation-skill').prop("checked") && skill.indexOf("Creation") >= 0
            || $('#chk-equip-skill-veg-skill').prop("checked") && skill.indexOf("Vegetable") >= 0
            || $('#chk-equip-skill-fish-skill').prop("checked") && skill.indexOf("Fish") >= 0
            || $('#chk-equip-skill-material-skill').prop("checked") &&
            skill.indexOf("Meat") >= 0 && skill.indexOf("Creation") >= 0 &&
            skill.indexOf("Vegetable") >= 0 && skill.indexOf("Fish") >= 0
        ) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var check = $('#chk-equip-no-origin').prop("checked");
        var origin = data[5];   // origin

        if (check || !check && origin) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('equip-table')) {
            return true;
        }

        var value = $.trim($("#pane-equips .search-box input").val());
        var searchCols = [2, 4, 5];    // name, skill, origin

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $('.chk-equip-show').click(function () {
        initEquipShow();
        updateMenuLocalData();
    });

    $('#chk-equip-show-all').click(function () {
        if ($('.chk-equip-show:checked').length == $('.chk-equip-show').length) {
            $('.chk-equip-show').prop("checked", false);
        }
        else {
            $('.chk-equip-show').prop("checked", true);
        }
        initEquipShow();
        updateMenuLocalData();
    });

    $('.chk-equip-skill').click(function () {
        if ($(this).prop("checked")) {
            if ($('#chk-equip-single-skill').prop("checked")) {
                $(".chk-equip-skill").not(this).prop("checked", false);
            }
        }
        equipTable.draw();
    });

    $('#chk-equip-single-skill').change(function () {
        if ($(this).prop("checked")) {
            if ($('.chk-equip-skill:checked').length > 1) {
                $('.chk-equip-skill').prop("checked", false);
                equipTable.draw();
            }
        }
    });

    $('#chk-equip-skill-all').click(function () {
        if ($('#chk-equip-single-skill').prop("checked")) {
            $('#chk-equip-single-skill').bootstrapToggle('off');
        }
        $(".chk-equip-skill").prop("checked", true);
        equipTable.draw();
    });

    $('#chk-equip-no-origin').click(function () {
        equipTable.draw();
    });

    $('#pane-equips .search-box input').keyup(function () {
        equipTable.draw();
    });

    if (private) {
        $('#chk-equip-no-origin').closest(".box").removeClass('hidden');
    }

    initEquipShow();
}

function initDecorationTable(data) {
    var decorationColumns = [
        {
            "data": undefined,
            "defaultContent": "",
            "className": 'select-checkbox',
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
            "data": "name"
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
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "maxEff",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "avgEff",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "position"
        },
        {
            "data": "suit",
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
        fixedHeader: true
    });

    $("#pane-decorations div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="名字 套装 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var position = rowData.position;

        if ($('#chk-decoration-position-1').prop("checked") && position == "1大桌"
            || $('#chk-decoration-position-2').prop("checked") && position == "1小桌"
            || $('#chk-decoration-position-3').prop("checked") && position == "2大桌"
            || $('#chk-decoration-position-4').prop("checked") && position == "2小桌"
            || $('#chk-decoration-position-5').prop("checked") && position == "3大桌"
            || $('#chk-decoration-position-6').prop("checked") && position == "3小桌"
            || $('#chk-decoration-position-7').prop("checked") && position == "1窗"
            || $('#chk-decoration-position-8').prop("checked") && position == "1装饰"
            || $('#chk-decoration-position-9').prop("checked") && position == "1门"
            || $('#chk-decoration-position-10').prop("checked") && position == "1灯"
            || $('#chk-decoration-position-11').prop("checked") && position == "2装饰"
            || $('#chk-decoration-position-12').prop("checked") && position == "2门"
            || $('#chk-decoration-position-13').prop("checked") && position == "2窗"
            || $('#chk-decoration-position-14').prop("checked") && position == "2屏风"
            || $('#chk-decoration-position-15').prop("checked") && position == "3灯"
            || $('#chk-decoration-position-16').prop("checked") && position == "3包间"
        ) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex, rowData, counter) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var origin = rowData.origin;

        var check = $('#chk-decoration-no-origin').prop("checked");

        if (check || !check && origin) {
            return true;
        }
        else {
            return false;
        }
    });

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('decoration-table')) {
            return true;
        }

        var value = $.trim($("#pane-decorations .search-box input").val());
        var searchCols = [3, 12, 14];    // name, suit, origin

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $('.chk-decoration-show').click(function () {
        initDecorationShow();
        updateMenuLocalData();
    });

    $('#chk-decoration-show-all').click(function () {
        if ($('.chk-decoration-show:checked').length == $('.chk-decoration-show').length) {
            $('.chk-decoration-show').prop("checked", false);
        }
        else {
            $('.chk-decoration-show').prop("checked", true);
        }
        initDecorationShow();
        updateMenuLocalData();
    });

    $('.chk-decoration-position').click(function () {
        if ($(this).prop("checked")) {
            if ($('#chk-decoration-single-position').prop("checked")) {
                $(".chk-decoration-position").not(this).prop("checked", false);
            }
        }
        decorationTable.draw();
    });

    $('#chk-decoration-single-position').change(function () {
        if ($(this).prop("checked")) {
            if ($('.chk-decoration-position:checked').length > 1) {
                $('.chk-decoration-position').prop("checked", false);
                decorationTable.draw();
            }
        }
    });

    $('#chk-decoration-position-all').click(function () {
        if ($('#chk-decoration-single-position').prop("checked")) {
            $('#chk-decoration-single-position').bootstrapToggle('off');
        }
        $(".chk-decoration-position").prop("checked", true);
        decorationTable.draw();
    });

    $('#chk-decoration-no-origin').click(function () {
        decorationTable.draw();
    });

    $('#pane-decorations .search-box input').keyup(function () {
        decorationTable.draw();
    });

    var options = "<option></option>";
    for (var i in data.suits) {
        options += "<option value='" + data.suits[i].name + "'>" + data.suits[i].name + "</option>";
    }
    $("#select-decoration-suit").append(options).selectpicker('refresh').change(function () {
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

    if (private) {
        $('#chk-decoration-no-origin').closest(".box").removeClass('hidden');
    }

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

    $('#select-material-origin').change(function () {
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
            "data": "name"
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
        autoWidth: false
    });

    materialTable.draw();
}

function initQuestTable(data) {

    for (var i in data.activities) {
        $('#select-quest-type').append("<option>" + data.activities[i].name + "</option>");
    }

    var questColumns = [
        {
            "data": "questId",
            "width": "1px"
        },
        {
            "data": "preId",
            "defaultContent": "",
            "orderable": false,
            "width": "30px"
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
        fixedHeader: true
    });

    $("#pane-quest div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="编号 任务 奖励"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('quest-table')) {
            return true;
        }

        var value = $.trim($("#pane-quest .search-box input").val());
        var searchCols = [0, 2, 3];    // questId, goal, rewards

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $('#pane-quest .search-box input').keyup(function () {
        questTable.draw();
    });

    $('#select-quest-type').change(function () {
        var questsData = getQuestsData(data.quests, $(this).val());
        questTable.clear().rows.add(questsData).draw();
        initQuestShow(questTable);
    });

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
        }, 500);
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
        }, 500);
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

    if (person.decorationEffect) {
        data.decorationEffect = person.decorationEffect;
        $("#input-cal-decoration").val(person.decorationEffect || "");
    }

    try {
        localStorage.setItem('data', generateExportData());
    } catch (e) { }

    data = getUpdateData(data);

    $('#recipe-table').DataTable().clear().rows.add(data.recipes).draw();
    $('#chef-table').DataTable().clear().rows.add(data.chefs).draw();
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

    var recipeMenu = {};
    recipeMenu["id"] = $("#chk-recipe-show-id").prop("checked");
    recipeMenu["icon"] = $("#chk-recipe-show-icon").prop("checked");
    recipeMenu["rarity"] = $("#chk-recipe-show-rarity").prop("checked");
    recipeMenu["skill"] = $("#chk-recipe-show-skill").prop("checked");
    recipeMenu["materials"] = $("#chk-recipe-show-materials").prop("checked");
    recipeMenu["price"] = $("#chk-recipe-show-price").prop("checked");
    recipeMenu["exPrice"] = $("#chk-recipe-show-ex-price").prop("checked");
    recipeMenu["exTime"] = $("#chk-recipe-show-ex-time").prop("checked");
    recipeMenu["time"] = $("#chk-recipe-show-time").prop("checked");
    recipeMenu["limit"] = $("#chk-recipe-show-limit").prop("checked");
    recipeMenu["totalPrice"] = $("#chk-recipe-show-total-price").prop("checked");
    recipeMenu["totalTime"] = $("#chk-recipe-show-total-time").prop("checked");
    recipeMenu["efficiency"] = $("#chk-recipe-show-efficiency").prop("checked");
    recipeMenu["materialsEfficiency"] = $("#chk-recipe-show-materials-efficiency").prop("checked");
    recipeMenu["origin"] = $("#chk-recipe-show-origin").prop("checked");
    recipeMenu["unlock"] = $("#chk-recipe-show-unlock").prop("checked");
    recipeMenu["combo"] = $("#chk-recipe-show-combo").prop("checked");
    recipeMenu["tags"] = $("#chk-recipe-show-tags").prop("checked");
    recipeMenu["guest"] = $("#chk-recipe-show-guest").prop("checked");
    recipeMenu["rankGuest"] = $("#chk-recipe-show-rank-guest").prop("checked");
    recipeMenu["rankAntique"] = $("#chk-recipe-show-rank-antique").prop("checked");
    recipeMenu["rank"] = $("#chk-recipe-show-rank").prop("checked");
    recipeMenu["ex"] = $("#chk-recipe-show-ex").prop("checked");
    recipeMenu["got"] = $("#chk-recipe-show-got").prop("checked");
    exportData["recipe"] = recipeMenu;

    var chefMenu = {};
    chefMenu["id"] = $("#chk-chef-show-id").prop("checked");
    chefMenu["icon"] = $("#chk-chef-show-icon").prop("checked");
    chefMenu["rarity"] = $("#chk-chef-show-rarity").prop("checked");
    chefMenu["skill"] = $("#chk-chef-show-skill").prop("checked");
    chefMenu["chefSkill"] = $("#chk-chef-show-chef-skill").prop("checked");
    chefMenu["explore"] = $("#chk-chef-show-explore").prop("checked");
    chefMenu["gender"] = $("#chk-chef-show-gender").prop("checked");
    chefMenu["origin"] = $("#chk-chef-show-origin").prop("checked");
    chefMenu["tags"] = $("#chk-chef-show-tags").prop("checked");
    chefMenu["equip"] = $("#chk-chef-show-equip").prop("checked");
    chefMenu["ultimateGoal"] = $("#chk-chef-show-ultimate-goal").prop("checked");
    chefMenu["ultimateSkill"] = $("#chk-chef-show-ultimate-skill").prop("checked");
    chefMenu["ultimate"] = $("#chk-chef-show-ultimate").prop("checked");
    chefMenu["got"] = $("#chk-chef-show-got").prop("checked");
    exportData["chef"] = chefMenu;

    var equipMenu = {};
    equipMenu["id"] = $("#chk-equip-show-id").prop("checked");
    equipMenu["icon"] = $("#chk-equip-show-icon").prop("checked");
    equipMenu["rarity"] = $("#chk-equip-show-rarity").prop("checked");
    equipMenu["skill"] = $("#chk-equip-show-skill").prop("checked");
    equipMenu["origin"] = $("#chk-equip-show-origin").prop("checked");
    exportData["equip"] = equipMenu;

    var decorationMenu = {};
    decorationMenu["id"] = $("#chk-decoration-show-id").prop("checked");
    decorationMenu["icon"] = $("#chk-decoration-show-icon").prop("checked");
    decorationMenu["minEff"] = $("#chk-decoration-show-min-eff").prop("checked");
    decorationMenu["maxEff"] = $("#chk-decoration-show-max-eff").prop("checked");
    decorationMenu["avgEff"] = $("#chk-decoration-show-avg-eff").prop("checked");
    decorationMenu["position"] = $("#chk-decoration-show-position").prop("checked");
    decorationMenu["suit"] = $("#chk-decoration-show-suit").prop("checked");
    decorationMenu["suitGold"] = $("#chk-decoration-show-suit-gold").prop("checked");
    decorationMenu["origin"] = $("#chk-decoration-show-origin").prop("checked");
    exportData["decoration"] = decorationMenu;

    return exportData;
}

function updateMenu(person) {
    if (person && person.menu) {
        var recipeMenu = person.menu.recipe;
        if (recipeMenu) {
            $("#chk-recipe-show-id").prop("checked", recipeMenu.id || false);
            $("#chk-recipe-show-icon").prop("checked", recipeMenu.icon || false);
            $("#chk-recipe-show-rarity").prop("checked", recipeMenu.rarity || false);
            $("#chk-recipe-show-skill").prop("checked", recipeMenu.skill || false);
            $("#chk-recipe-show-materials").prop("checked", recipeMenu.materials || false);
            $("#chk-recipe-show-price").prop("checked", recipeMenu.price || false);
            $("#chk-recipe-show-ex-price").prop("checked", recipeMenu.exPrice || false);
            $("#chk-recipe-show-ex-time").prop("checked", recipeMenu.exTime || false);
            $("#chk-recipe-show-time").prop("checked", recipeMenu.time || false);
            $("#chk-recipe-show-limit").prop("checked", recipeMenu.limit || false);
            $("#chk-recipe-show-total-price").prop("checked", recipeMenu.totalPrice || false);
            $("#chk-recipe-show-total-time").prop("checked", recipeMenu.totalTime || false);
            $("#chk-recipe-show-efficiency").prop("checked", recipeMenu.efficiency || false);
            $("#chk-recipe-show-materials-efficiency").prop("checked", recipeMenu.materialsEfficiency || false);
            $("#chk-recipe-show-origin").prop("checked", recipeMenu.origin || false);
            $("#chk-recipe-show-unlock").prop("checked", recipeMenu.unlock || false);
            $("#chk-recipe-show-combo").prop("checked", recipeMenu.combo || false);
            $("#chk-recipe-show-tags").prop("checked", recipeMenu.tags || false);
            $("#chk-recipe-show-guest").prop("checked", recipeMenu.guest || false);
            $("#chk-recipe-show-rank-guest").prop("checked", recipeMenu.rankGuest || false);
            $("#chk-recipe-show-rank-antique").prop("checked", recipeMenu.rankAntique || false);
            $("#chk-recipe-show-rank").prop("checked", recipeMenu.rank || false);
            $("#chk-recipe-show-ex").prop("checked", recipeMenu.ex || false);
            $("#chk-recipe-show-got").prop("checked", recipeMenu.got || false);
        }

        var chefMenu = person.menu.chef;
        if (chefMenu) {
            $("#chk-chef-show-id").prop("checked", chefMenu.id || false);
            $("#chk-chef-show-icon").prop("checked", chefMenu.icon || false);
            $("#chk-chef-show-rarity").prop("checked", chefMenu.rarity || false);
            $("#chk-chef-show-skill").prop("checked", chefMenu.skill || false);
            $("#chk-chef-show-chef-skill").prop("checked", chefMenu.chefSkill || false);
            $("#chk-chef-show-explore").prop("checked", chefMenu.explore || false);
            $("#chk-chef-show-gender").prop("checked", chefMenu.gender || false);
            $("#chk-chef-show-origin").prop("checked", chefMenu.origin || false);
            $("#chk-chef-show-tags").prop("checked", chefMenu.tags || false);
            $("#chk-chef-show-equip").prop("checked", chefMenu.equip || false);
            $("#chk-chef-show-ultimate-goal").prop("checked", chefMenu.ultimateGoal || false);
            $("#chk-chef-show-ultimate-skill").prop("checked", chefMenu.ultimateSkill || false);
            $("#chk-chef-show-ultimate").prop("checked", chefMenu.ultimate || false);
            $("#chk-chef-show-got").prop("checked", chefMenu.got || false);
        }

        var equipMenu = person.menu.equip;
        if (equipMenu) {
            $("#chk-equip-show-id").prop("checked", equipMenu.id || false);
            $("#chk-equip-show-icon").prop("checked", equipMenu.icon || false);
            $("#chk-equip-show-rarity").prop("checked", equipMenu.rarity || false);
            $("#chk-equip-show-skill").prop("checked", equipMenu.skill || false);
            $("#chk-equip-show-origin").prop("checked", equipMenu.origin || false);
        }

        var decorationMenu = person.menu.decoration;
        if (decorationMenu) {
            $("#chk-decoration-show-id").prop("checked", decorationMenu.id || false);
            $("#chk-decoration-show-icon").prop("checked", decorationMenu.icon || false);
            $("#chk-decoration-show-min-eff").prop("checked", decorationMenu.minEff || false);
            $("#chk-decoration-show-max-eff").prop("checked", decorationMenu.maxEff || false);
            $("#chk-decoration-show-avg-eff").prop("checked", decorationMenu.avgEff || false);
            $("#chk-decoration-show-position").prop("checked", decorationMenu.position || false);
            $("#chk-decoration-show-suit").prop("checked", decorationMenu.suit || false);
            $("#chk-decoration-show-suit-gold").prop("checked", decorationMenu.suitGold || false);
            $("#chk-decoration-show-origin").prop("checked", decorationMenu.origin || false);
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
    $("#select-cal-rule").append(options).selectpicker('refresh').change(function () {
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

        }, 500);

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

        }, 500);
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

    if (cal) {
        $("#chk-cal-no-origin").prop("checked", true);
    }

    if (private) {
        $("#chk-cal-no-origin").closest(".box").removeClass('hidden');
    }
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
            "className": 'select-checkbox',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "name"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "stirfryVal",
                "display": "stirfryDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "boilVal",
                "display": "boilDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "knifeVal",
                "display": "knifeDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "fryVal",
                "display": "fryDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "bakeVal",
                "display": "bakeDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": {
                "_": "steamVal",
                "display": "steamDisp"
            },
            "orderSequence": ["desc", "asc"]
        },
        {
            "data": "specialSkillDisp"
        },
        {
            "data": "gender"
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
            "className": "cal-td-input-addition",
            "orderSequence": ["desc", "asc"],
            "width": "38px"
        },
        {
            "data": "equipName",
            "className": "cal-td-select-equip",
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
        }
    });

    $("#pane-cal-chefs div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="名字 性别"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('cal-chefs-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-chefs .search-box input").val());
        var searchCols = [2, 11, 13];   //name, gender, tags

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
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

    $('.chk-cal-chefs-show').click(function () {
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
            "className": 'select-checkbox',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "galleryId",
            "width": "1px"
        },
        {
            "data": "name"
        },
        {
            "data": {
                "_": "rarity",
                "display": "rarityDisp"
            },
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
        }
    });

    $("#pane-cal-equips div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="名字 技能 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('cal-equips-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-equips .search-box input").val());
        var searchCols = [2, 4, 5];   // name, skill, origin

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    $('.chk-cal-equips-show').click(function () {
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
            "className": 'select-checkbox',
            "orderDataType": "dom-selected",
            "orderSequence": ["desc", "asc"],
            "width": "30px"
        },
        {
            "data": "materialId",
            "width": "1px"
        },
        {
            "data": "name"
        },
        {
            "data": "origin"
        },
        {
            "data": "quantity",
            "className": "cal-td-input-quantity",
            "orderSequence": ["desc", "asc"],
            "width": "38px"
        },
        {
            "data": "addition",
            "className": "cal-td-input-addition",
            "orderSequence": ["desc", "asc"],
            "width": "38px"
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
        }
    });

    $("#pane-cal-materials div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="名字 来源"></label>');

    $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
        if (settings.nTable != document.getElementById('cal-materials-table')) {
            return true;
        }

        var value = $.trim($("#pane-cal-materials .search-box input").val());
        var searchCols = [2, 3];   //name, origin

        for (var i = 0, len = searchCols.length; i < len; i++) {
            if (data[searchCols[i]].indexOf(value) !== -1) {
                return true;
            }
        }

        return false;
    });

    calMaterialsTable.MakeCellsEditable({
        "columns": [4, 5]  // addition, quantity
    });

    $('.chk-cal-materials-show').click(function () {
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
    initCalResultTableCommon("self-select", $("#pane-cal-self-select"), data);

    $("#pane-cal-recipes-results").html($("#pane-cal-results-common").html());
    $("#pane-cal-recipes-results .cal-results-table").prop("id", "cal-recipes-results-table");
    initCalResultTableCommon("recipes", $("#pane-cal-recipes-results"), data);

    if (private) {
        $("#cal-optimal-results-place").html($("#pane-cal-results-common").html());
        $("#cal-optimal-results-place .cal-results-table").prop("id", "cal-optimal-results-table");
        initCalResultTableCommon("optimal", $("#pane-cal-optimal-results"), data);

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

function initCalResultTableCommon(mode, panel, data) {

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
            "width": "140px"
        },
        {
            "data": {
                "_": "recipe.data.rarity",
                "display": "recipe.data.rarityDisp"
            },
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
        },
        {
            "data": "recipe.data.stirfry",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "25px"
        },
        {
            "data": "recipe.data.boil",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "25px"
        },
        {
            "data": "recipe.data.knife",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "25px"
        },
        {
            "data": "recipe.data.fry",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "25px"
        },
        {
            "data": "recipe.data.bake",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "25px"
        },
        {
            "data": "recipe.data.steam",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "25px"
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
            "width": "38px"
        },
        {
            "data": "recipe.available",
            "defaultContent": "",
            "orderSequence": ["desc", "asc"],
            "width": "60px"
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
            "width": "60px"
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
        panel.find("div.search-box").html('<label>查找:<input type="search" class="form-control input-sm" placeholder="菜名 材料"></label>');
        panel.find('.search-box input').keyup(function () {
            table.draw();
        });

        $.fn.dataTableExt.afnFiltering.push(function (settings, data, dataIndex) {
            if (settings.nTable != document.getElementById('cal-recipes-results-table')) {
                return true;
            }

            var value = $.trim($("#pane-cal-recipes-results .search-box input").val());
            var searchCols = [5, 13];   //recipename, materials

            for (var i = 0, len = searchCols.length; i < len; i++) {
                if (data[searchCols[i]].indexOf(value) !== -1) {
                    return true;
                }
            }

            return false;
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
        equip["effect"] = skillInfo.skillEffect;
        var skillFilter = [];
        for (var j in skillInfo.skillEffect) {
            skillFilter.push(skillInfo.skillEffect[j].type);
        }
        equip["skillFilter"] = skillFilter;

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
        decoration.tipMin = decoration.tipMin || "";
        decoration.tipMax = decoration.tipMax || "";
        decoration["tipTimeDisp"] = secondsToTime(decoration.tipTime);
        if (decoration.tipTime) {
            decoration["minEff"] = +(decoration.tipMin * 3600 * 24 / decoration.tipTime).toFixed(1);
            decoration["maxEff"] = +(decoration.tipMax * 3600 * 24 / decoration.tipTime).toFixed(1);
            decoration["avgEff"] = +((decoration.tipMin + decoration.tipMax) / 2 * 3600 * 24 / decoration.tipTime).toFixed(1);
        }

        decoration["goldDisp"] = getPercentDisp(+(decoration.gold * 100).toFixed(2));
        decoration["suitGoldDisp"] = getPercentDisp(+(decoration.suitGold * 100).toFixed(2));

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

    var showChefFinal = $("#chk-chef-show-final").prop("checked");
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var usePerson = $("#chk-chef-apply-ultimate-person").prop("checked");
    var ultimateData = getUltimateData(json.chefs, person, json.skills, useUltimate, usePerson);

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

        var ultimateGoal = "";
        for (var j in json.chefs[i].ultimateGoal) {
            ultimateGoal += json.chefs[i].ultimateGoal[j] + "<br>";
        }
        var ultimateSkillInfo = getSkillInfo(json.skills, json.chefs[i].ultimateSkill);
        var ultimateSkillDisp = ultimateSkillInfo.skillDisp;

        chefData["ultimateGoal"] = ultimateGoal;
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

        setDataForChef(chefData, chefData.equip, useEquip, ultimateData.global, ultimateData.partial, null, ultimateData.self, showChefFinal);

        chefsData.push(chefData);
    }
    retData["chefs"] = chefsData;

    var showRecipeFinal = $("#chk-recipe-show-final").prop("checked");

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
        setDataForRecipe(recipeData, ultimateData.global, useEx, showRecipeFinal);

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

        recipeData["combo"] = "";
        for (var m in json.combos) {
            for (var n in json.combos[m].recipes) {
                if (json.combos[m].recipes[n] == json.recipes[i].recipeId) {
                    for (var o in json.recipes) {
                        if (json.recipes[o].recipeId == json.combos[m].recipeId) {
                            recipeData["combo"] = json.recipes[o].name;
                            break;
                        }
                    }
                    // hardcode
                    if (json.combos[m].recipeId == 5004) {
                        recipeData["combo"] = "港式早茶";
                    }
                    break;
                }
            }
        }

        var rankGuestInfo = getRankGuestInfo(json.recipes[i], recipeData.rank);
        recipeData["rankGuestsVal"] = rankGuestInfo.rankGuestsVal;
        recipeData["rankGuestsDisp"] = rankGuestInfo.rankGuestsDisp;

        var guests = "";
        for (var m in json.guests) {
            for (var n in json.guests[m].gifts) {
                if (json.recipes[i].name == json.guests[m].gifts[n].recipe) {
                    guests += json.guests[m].name + "-" + json.guests[m].gifts[n].antique + "<br>";
                    break;
                }
            }
        }
        recipeData["guestsDisp"] = guests;

        recipesData.push(recipeData);
    }

    retData["recipes"] = recipesData;

    return retData;
}

function updateRecipeChefTable(data) {
    $('.loading').removeClass("hidden");

    setTimeout(function () {
        data = getUpdateData(data);
        $('#recipe-table').DataTable().clear().rows.add(data.recipes).draw(false);
        $('#chef-table').DataTable().clear().rows.add(data.chefs).draw(false);
        $('.loading').addClass("hidden");
    }, 500);

    $("#btn-chef-recal").closest(".box").addClass("hidden");
    $("#btn-recipe-recal").closest(".box").addClass("hidden");
}

function getUpdateData(data) {

    var person;
    try {
        var localData = localStorage.getItem('data');
        person = JSON.parse(localData);
    } catch (e) { }

    var showChefFinal = $("#chk-chef-show-final").prop("checked");
    var useEquip = $("#chk-chef-apply-equips").prop("checked");
    var useUltimate = $("#chk-chef-apply-ultimate").prop("checked");
    var usePerson = $("#chk-chef-apply-ultimate-person").prop("checked");
    var ultimateData = getUltimateData(data.chefs, person, data.skills, useUltimate, usePerson);

    var partialChefIds = $('#chk-chef-partial-ultimate').val();
    var otherPartialUltimateData = getPartialUltimateData(data.chefs, data.partialSkill, useUltimate, partialChefIds);

    for (var i in data.chefs) {
        setDataForChef(data.chefs[i], data.chefs[i].equip, useEquip, ultimateData.global, ultimateData.partial, otherPartialUltimateData, ultimateData.self, showChefFinal);
    }

    var showRecipeFinal = $("#chk-recipe-show-final").prop("checked");
    for (var i in data.recipes) {
        var useEx = ifUseEx(data.recipes[i]);
        setDataForRecipe(data.recipes[i], ultimateData.global, useEx, showRecipeFinal);
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
                materialsVal += materials[m].name;
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

    for (var i in recipe.guests) {
        if (filter) {
            if (rank == "优" && i == 0
                || rank == "特" && i != 2
                || rank == "神") {
                continue;
            }
        }

        var rankDisp = "";
        if (i == 0) {
            rankDisp = "优"
        } else if (i == 1) {
            rankDisp = "特"
        } else if (i == 2) {
            rankDisp = "神"
        }

        rankGuestsDisp += rankDisp + "-" + recipe.guests[i].guest + "<br>";
        rankGuestsVal += recipe.guests[i].guest + " ";
    }

    var retData = {};
    retData["rankGuestsVal"] = rankGuestsVal;
    retData["rankGuestsDisp"] = rankGuestsDisp;
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
    for (var i in chefs) {
        if (chefs[i].ultimateSkill) {
            for (var k in skills) {
                if (chefs[i].ultimateSkill == skills[k].skillId) {
                    for (var m in skills[k].effect) {
                        if (skills[k].effect[m].condition == "Partial") {
                            var skillInfo = getSkillInfo(skills, skills[k].skillId);
                            var option = "<option value='" + chefs[i].chefId + "' data-subtext='" + skillInfo.skillDisp + "'>" + chefs[i].name + "</option>";
                            if (skills[k].effect[m].type != "OpenTime") {
                                $('#chk-chef-partial-ultimate').append(option);
                            }
                            $('#chk-cal-partial-ultimate').append(option);
                        }
                    }
                }
            }
        }
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
                                var option = "<option value='" + chefs[i].chefId + "' data-subtext='" + skillInfo.skillDisp + "'>" + chefs[i].name + "</option>";
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

function initRecipeShow() {
    var recipeTable = $('#recipe-table').DataTable();

    recipeTable.fixedHeader.disable();

    recipeTable.column(0).visible($('#chk-recipe-show-id').prop("checked"), false);
    recipeTable.column(1).visible($('#chk-recipe-show-icon').prop("checked"), false);
    recipeTable.column(3).visible($('#chk-recipe-show-rarity').prop("checked"), false);

    var chkSkill = $('#chk-recipe-show-skill').prop("checked");
    recipeTable.column(4).visible(chkSkill, false);
    recipeTable.column(5).visible(chkSkill, false);
    recipeTable.column(6).visible(chkSkill, false);
    recipeTable.column(7).visible(chkSkill, false);
    recipeTable.column(8).visible(chkSkill, false);
    recipeTable.column(9).visible(chkSkill, false);
    recipeTable.column(10).visible($('#chk-recipe-show-materials').prop("checked"), false);
    recipeTable.column(11).visible($('#chk-recipe-show-price').prop("checked"), false);
    recipeTable.column(12).visible($('#chk-recipe-show-ex-price').prop("checked"), false);
    recipeTable.column(13).visible($('#chk-recipe-show-ex-time').prop("checked"), false);
    recipeTable.column(14).visible($('#chk-recipe-show-time').prop("checked"), false);
    recipeTable.column(15).visible($('#chk-recipe-show-limit').prop("checked"), false);
    recipeTable.column(16).visible($('#chk-recipe-show-total-price').prop("checked"), false);
    recipeTable.column(17).visible($('#chk-recipe-show-total-time').prop("checked"), false);
    recipeTable.column(18).visible($('#chk-recipe-show-efficiency').prop("checked"), false);
    recipeTable.column(19).visible($('#chk-recipe-show-materials-efficiency').prop("checked"), false);
    recipeTable.column(20).visible($('#chk-recipe-show-origin').prop("checked"), false);
    recipeTable.column(21).visible($('#chk-recipe-show-unlock').prop("checked"), false);
    recipeTable.column(22).visible($('#chk-recipe-show-combo').prop("checked"), false);

    if (cal) {
        recipeTable.column(23).visible($('#chk-recipe-show-tags').prop("checked"), false);
    } else {
        recipeTable.column(23).visible(false, false);
    }

    recipeTable.column(24).visible($('#chk-recipe-show-guest').prop("checked"), false);
    recipeTable.column(25).visible($('#chk-recipe-show-rank-guest').prop("checked"), false);
    recipeTable.column(26).visible($('#chk-recipe-show-rank-antique').prop("checked"), false);
    recipeTable.column(27).visible($('#chk-recipe-show-rank').prop("checked"), false);
    recipeTable.column(28).visible($('#chk-recipe-show-ex').prop("checked"), false);
    recipeTable.column(29).visible($('#chk-recipe-show-got').prop("checked"), false);

    recipeTable.columns.adjust().draw(false);
    recipeTable.fixedHeader.enable();
}

function initChefShow() {
    var chefTable = $('#chef-table').DataTable();

    chefTable.fixedHeader.disable();

    chefTable.column(0).visible($('#chk-chef-show-id').prop("checked"), false);
    chefTable.column(1).visible($('#chk-chef-show-icon').prop("checked"), false);
    chefTable.column(3).visible($('#chk-chef-show-rarity').prop("checked"), false);

    var chkSkill = $('#chk-chef-show-skill').prop("checked");
    chefTable.column(4).visible(chkSkill, false);
    chefTable.column(5).visible(chkSkill, false);
    chefTable.column(6).visible(chkSkill, false);
    chefTable.column(7).visible(chkSkill, false);
    chefTable.column(8).visible(chkSkill, false);
    chefTable.column(9).visible(chkSkill, false);
    chefTable.column(10).visible($('#chk-chef-show-chef-skill').prop("checked"), false);
    var chkExplore = $('#chk-chef-show-explore').prop("checked");
    chefTable.column(11).visible(chkExplore, false);
    chefTable.column(12).visible(chkExplore, false);
    chefTable.column(13).visible(chkExplore, false);
    chefTable.column(14).visible(chkExplore, false);
    chefTable.column(15).visible($('#chk-chef-show-gender').prop("checked"), false);
    chefTable.column(16).visible($('#chk-chef-show-origin').prop("checked"), false);

    if (cal) {
        chefTable.column(17).visible($('#chk-chef-show-tags').prop("checked"), false);
    } else {
        chefTable.column(17).visible(false, false);
    }

    chefTable.column(18).visible($('#chk-chef-show-equip').prop("checked"), false);
    chefTable.column(19).visible($('#chk-chef-show-ultimate-goal').prop("checked"), false);
    chefTable.column(20).visible($('#chk-chef-show-ultimate-skill').prop("checked"), false);
    chefTable.column(21).visible($('#chk-chef-show-ultimate').prop("checked"), false);
    chefTable.column(22).visible($('#chk-chef-show-got').prop("checked"), false);

    chefTable.columns.adjust().draw(false);
    chefTable.fixedHeader.enable();
}

function initEquipShow() {
    var equipTable = $('#equip-table').DataTable();

    equipTable.fixedHeader.disable();

    equipTable.column(0).visible($('#chk-equip-show-id').prop("checked"), false);
    equipTable.column(1).visible($('#chk-equip-show-icon').prop("checked"), false);
    equipTable.column(3).visible($('#chk-equip-show-rarity').prop("checked"), false);
    equipTable.column(4).visible($('#chk-equip-show-skill').prop("checked"), false);
    equipTable.column(5).visible($('#chk-equip-show-origin').prop("checked"), false);

    equipTable.columns.adjust().draw(false);
    equipTable.fixedHeader.enable();
}

function initDecorationShow() {
    var decorationTable = $('#decoration-table').DataTable();

    decorationTable.fixedHeader.disable();

    decorationTable.column(0).visible($('#chk-decoration-show-select').prop("checked"), false);
    decorationTable.column(1).visible($('#chk-decoration-show-id').prop("checked"), false);
    decorationTable.column(2).visible($('#chk-decoration-show-icon').prop("checked"), false);
    decorationTable.column(8).visible($('#chk-decoration-show-min-eff').prop("checked"), false);
    decorationTable.column(9).visible($('#chk-decoration-show-max-eff').prop("checked"), false);
    decorationTable.column(10).visible($('#chk-decoration-show-avg-eff').prop("checked"), false);
    decorationTable.column(11).visible($('#chk-decoration-show-position').prop("checked"), false);
    decorationTable.column(12).visible($('#chk-decoration-show-suit').prop("checked"), false);
    decorationTable.column(13).visible($('#chk-decoration-show-suit-gold').prop("checked"), false);
    decorationTable.column(14).visible($('#chk-decoration-show-origin').prop("checked"), false);

    decorationTable.columns.adjust().draw(false);
    decorationTable.fixedHeader.enable();
}

function initQuestShow(questTable) {
    questTable.fixedHeader.disable();
    questTable.column(1).visible($('#select-quest-type').val() == "支线任务", false);
    questTable.columns.adjust().draw(false);
    questTable.fixedHeader.enable();
}

function initCalChefsShow(calChefsTable) {
    calChefsTable.column(1).visible($('#chk-cal-chefs-show-id').prop("checked"), false);
    calChefsTable.column(3).visible($('#chk-cal-chefs-show-rarity').prop("checked"), false);

    var chkSkill = $('#chk-cal-chefs-show-skill').prop("checked");
    calChefsTable.column(4).visible(chkSkill, false);
    calChefsTable.column(5).visible(chkSkill, false);
    calChefsTable.column(6).visible(chkSkill, false);
    calChefsTable.column(7).visible(chkSkill, false);
    calChefsTable.column(8).visible(chkSkill, false);
    calChefsTable.column(9).visible(chkSkill, false);

    calChefsTable.column(10).visible($('#chk-cal-chefs-show-chef-skill').prop("checked"), false);
    calChefsTable.column(11).visible($('#chk-cal-chefs-show-gender').prop("checked"), false);
    calChefsTable.column(12).visible($('#chk-cal-chefs-show-origin').prop("checked"), false);
    calChefsTable.column(13).visible($('#chk-cal-chefs-show-tags').prop("checked"), false);

    calChefsTable.columns.adjust().draw(false);
}

function initCalEquipsShow(calEquipsTable) {
    calEquipsTable.column(1).visible($('#chk-cal-equips-show-id').prop("checked"), false);
    calEquipsTable.column(3).visible($('#chk-cal-equips-show-rarity').prop("checked"), false);
    calEquipsTable.column(4).visible($('#chk-cal-equips-show-skill').prop("checked"), false);
    calEquipsTable.column(5).visible($('#chk-cal-equips-show-origin').prop("checked"), false);

    calEquipsTable.columns.adjust().draw(false);
}

function initCalMaterialsShow(calMaterialsTable) {
    calMaterialsTable.column(1).visible($('#chk-cal-materials-show-id').prop("checked"), false);
    calMaterialsTable.column(3).visible($('#chk-cal-materials-show-origin').prop("checked"), false);

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
            panel.find('.chk-cal-results-lock-order').closest(".box").removeClass("hidden");
            panel.find('.btn-cal-recipes-select-all').closest(".box").removeClass("hidden");
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
        pageSize: 10,
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

            $(this).on('close.bs.alert', function () {
                updateLocalData(key, value);
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
                                .insertBefore($(cell).find("ul.dropdown-menu"));

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