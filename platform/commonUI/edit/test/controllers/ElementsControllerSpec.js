/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2017, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global describe,it,expect,beforeEach,jasmine*/

define(
    ["../../src/controllers/ElementsController"],
    function (ElementsController) {

        describe("The Elements Pane controller", function () {
            var mockScope,
                mockOpenMCT,
                mockSelection,
                mockDomainObject,
                mockMutationCapability,
                mockUnlisten,
                selectable = [],
                controller;

            beforeEach(function () {
                mockUnlisten = jasmine.createSpy('unlisten');
                mockMutationCapability = jasmine.createSpyObj("mutationCapability", [
                    "listen"
                ]);
                mockMutationCapability.listen.andReturn(mockUnlisten);
                mockDomainObject = jasmine.createSpyObj("domainObject", [
                    "getCapability",
                    "useCapability"
                ]);
                mockDomainObject.useCapability.andCallThrough();
                mockDomainObject.getCapability.andReturn(mockMutationCapability);

                mockScope = jasmine.createSpyObj("$scope", ['$on']);
                mockSelection = jasmine.createSpyObj("selection", [
                    'on',
                    'off',
                    'get'
                ]);
                mockSelection.get.andReturn([]);
                mockOpenMCT = {
                    selection: mockSelection
                };

                selectable[0] = {
                    context: {
                        oldItem: mockDomainObject
                    }
                };

                spyOn(ElementsController.prototype, 'refreshComposition');

                controller = new ElementsController(mockScope, mockOpenMCT);
            });

            function getModel(model) {
                return function () {
                    return model;
                };
            }

            it("filters objects in elements pool based on input text and" +
                " object name", function () {
                var objects = [
                    {
                        getModel: getModel({name: "first element"})
                    },
                    {
                        getModel: getModel({name: "second element"})
                    },
                    {
                        getModel: getModel({name: "third element"})
                    },
                    {
                        getModel: getModel({name: "THIRD Element 1"})
                    }
                ];

                mockScope.filterBy("third element");
                expect(objects.filter(mockScope.searchElements).length).toBe(2);
                mockScope.filterBy("element");
                expect(objects.filter(mockScope.searchElements).length).toBe(4);
            });

            it("refreshes composition on selection", function () {
                mockOpenMCT.selection.on.mostRecentCall.args[1](selectable);

                expect(ElementsController.prototype.refreshComposition).toHaveBeenCalledWith(mockDomainObject);
            });

            it("listens on mutation and refreshes composition", function () {
                mockOpenMCT.selection.on.mostRecentCall.args[1](selectable);

                expect(mockDomainObject.getCapability).toHaveBeenCalledWith('mutation');
                expect(mockMutationCapability.listen).toHaveBeenCalled();
                expect(ElementsController.prototype.refreshComposition.calls.length).toBe(1);

                mockMutationCapability.listen.mostRecentCall.args[0](mockDomainObject);

                expect(ElementsController.prototype.refreshComposition.calls.length).toBe(2);
            });

            it("cleans up mutation listener when selection changes", function () {
                mockOpenMCT.selection.on.mostRecentCall.args[1](selectable);

                expect(mockMutationCapability.listen).toHaveBeenCalled();

                mockOpenMCT.selection.on.mostRecentCall.args[1](selectable);

                expect(mockUnlisten).toHaveBeenCalled();
            });

            it("does not listen on mutation for element proxy selectable", function () {
                selectable[0] = {
                    context: {
                        elementProxy: {}
                    }
                };
                mockOpenMCT.selection.on.mostRecentCall.args[1](selectable);

                expect(mockDomainObject.getCapability).not.toHaveBeenCalledWith('mutation');
            });
        });
    }
);
