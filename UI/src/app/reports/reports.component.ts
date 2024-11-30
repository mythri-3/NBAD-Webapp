import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import * as d3 from 'd3';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {

  private dataUrl = 'http://137.184.71.81:3000/api/aiUseCases'; // Replace with your API endpoint

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
    axios.get(this.dataUrl, {
      headers: {
        'Authorization': `Bearer ${token}`  // Attach the token in the Authorization header
      }
    }).then((response) => {
        const data = response.data;
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

  private createBarChart(data: any[]): void {
    const chartWidth = 600;
  const chartHeight = 400;
  const margin = { top: 20, right: 80, bottom: 40, left: 50 };

  // Clear any existing SVG (if the function is called multiple times)
  d3.select('#ai-bar-chart').selectAll('svg').remove();

  const svg = d3.select('#ai-bar-chart')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight);

  // Scales
  const x = d3.scalePoint()
    .domain(data.map(d => d.useCase))
    .range([margin.left, chartWidth - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.percentage)! * 1.2]) // Add some padding for better visualization
    .nice()
    .range([chartHeight - margin.bottom, margin.top]);

  const size = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.percentage)!])
    .range([5, 30]); // Adjust bubble sizes

  // X-axis
  svg.append('g')
    .attr('transform', `translate(0,${chartHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll('text')
    .style('text-anchor', 'middle');

  // Y-axis
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  // Add Y-axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 20)
    .attr('x', 0 - (chartHeight / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Percentage');

  // Bubbles
  svg.selectAll('.bubble')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'bubble')
    .attr('cx', d => x(d.useCase)!) // Map the x position to the use case
    .attr('cy', d => y(d.percentage)!) // Map the y position to the percentage
    .attr('r', d => size(d.percentage)!) // Scale bubble size based on percentage
    .attr('fill', '#09649d')
    .attr('opacity', 0.7);

  // Add text labels inside the bubbles
  svg.selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .attr('x', d => x(d.useCase)!)
    .attr('y', d => y(d.percentage)!)
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('fill', '#fff')
    .text(d => d.percentage);
  }
}
