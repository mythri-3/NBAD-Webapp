import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import * as d3 from 'd3';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  private apiUrl = 'http://137.184.71.81:3000/api/aiAdoption'; // Replace with your API endpoint

  constructor() {}

  ngOnInit(): void {
    this.fetchDataAndRenderChart();
  }

  private fetchDataAndRenderChart(): void {
    const token = localStorage.getItem('token');  // Retrieve the token from localStorage

    if (!token) {
      console.error('No token found');
      return;
    }
    axios.get(this.apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`  // Attach the token in the Authorization header
      }
    }).then((response) => {
        const data = response.data;
        console.log(data.data) // Adjust based on your API's data structure
        this.createBarChart(data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          alert('Session Expired.!!');
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        console.error('Error fetching data:', error);
      });
  }

  private createBarChart(data: { year: number; weeklyUsagePercentage: number }[]): void {

    const chartWidth = 600;
    const chartHeight = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3.select('#ai-line-chart')
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight);
      console.log(data)

    const x = d3.scaleBand()
      .domain(data.map(d => String(d.year)))
      .range([margin.left, chartWidth - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0,d3.max(data, d => d.weeklyUsagePercentage) as number] )
      .nice()
      .range([chartHeight - margin.bottom, margin.top]);

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Add Y-axis label
    svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 80)
    .attr('x', 0 - chartHeight / 2 - margin.top)
    .style('text-anchor', 'middle')
    .text('Weekly Usage Percentage');
    // Y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(String(d.year)) || 0 as number)
      .attr('y', d => y(d.weeklyUsagePercentage))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - margin.bottom - y(d.weeklyUsagePercentage))
      .attr('fill', '#09649d');
    }
}
