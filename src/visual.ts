/*
 *  Simple d3.js Line Chart
 *
 *  Copyright (c) Daniel Marsh-Patrick
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

'use strict';

import 'core-js/stable';
import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from './settings';
import * as d3 from 'd3';

/** This specifices the 'shape' of the data in each row. */
    interface ILineChartRow {
        date: Date,
        value: number
    }

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private container: d3.Selection<HTMLDivElement, any, HTMLDivElement, any>;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;

        /** Create the chart container when the visual loads */
            this.container = d3.select(this.target)
                .append('div')
                    .attr('id', 'my_dataviz');
    }

    public update(options: VisualUpdateOptions) {
        console.log('Visual update', options);
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        
        /** Clear down existing plot */
            this.container.selectAll('*').remove();

        /** Test 1: Data view has both fields added */
            let dataViews = options.dataViews;
            console.log('Test 1: Valid data view...');
            if (!dataViews
                || !dataViews[0]
                || !dataViews[0].categorical
                || !dataViews[0].categorical.categories
                || !dataViews[0].categorical.values
                || !dataViews[0].metadata
            ) {
                console.log('Test 1 FAILED. No data to draw table.');
                return;
            }

        /** If we get this far, we can trust that we can work with the data! */
            let categorical = dataViews[0].categorical;

        /** Test 2: Category matches our expected data type (dateTime) */
            console.log('Test 2: Category field has correct type (dateTime)...');
            if (!categorical.categories[0].source.type.dateTime) {
                console.log('Test 2 FAILED. Category is incorrect data type.');
                return;
            }

        /** Map our data into an array that looks like our reference visual.
         *  We're going to map the `categories[0].values` array in-place and return
         *  an `ILineChartRow` object for each entry. Because the values array elements
         *  correspond with their equivalent `categories[0].values` element, we can use
         *  the current index to get the value as we map.
         *  note that Power BI sees values as `PrimitiveType`, which means we need to 
         *  cast them as the types we need to match the interface we defined. */
            let data: ILineChartRow[] = categorical.categories[0].values.map(
                (cat, idx) => (
                    {
                        date: <Date>cat,
                        value: <number>categorical.values[0].values[idx]
                    }
                )
            );

        /** Parse our mapped data and view the output */
            console.log(data);

        /** Set the dimensions and margins of the graph */
            var margin = {top: 10, right: 30, bottom: 30, left: 60},
                width = options.viewport.width - margin.left - margin.right,
                height = options.viewport.height - margin.top - margin.bottom;

        /** Append the svg object to the body of the page */
            var svg = this.container
                .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                .append('g')
                    .attr('transform',
                        'translate(' + margin.left + ',' + margin.top + ')');

    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}