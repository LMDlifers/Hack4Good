<template>
	<div class="container">
		<div class="space-between">
			<h2>Weekly Report</h2>
			<button class="btn-download" @click="downloadPDF">
				Download Report as PDF
			</button>
		</div>
		
		<!-- Loading Indicator -->
		<div v-if="loading" class="loading">Loading...</div>

		<!-- Error Message -->
		<div v-if="error" class="error">{{ error }}</div>

		<!-- Report Content -->
		<div v-if="report && !loading && !error">
			
			<!-- Weekly Requests Section -->
			<div class="report-section margin-t-s">
				<h3>Weekly Requests</h3>
				<p>Total Requests: {{ report.weeklyRequests.total }}</p>
				<table class="table">
					<thead>
						<tr>
							<th>Product Name</th>
							<th>Quantity</th>
							<th>Status</th>
							<th>Request Date</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="request in report.weeklyRequests.details" :key="request.id">
							<td>{{ request.productName }}</td>
							<td>{{ request.quantity }}</td>
							<td>{{ request.status }}</td>
							<td>{{ formatDate(request.timestamp) }}</td>
						</tr>
					</tbody>
				</table>
				<p v-if="report.weeklyRequests.total === 0" class="no-data">
					No requests made this week.
				</p>
			</div>

			<!-- Inventory Summary Section -->
			<div class="report-section">
				<h3>Inventory Summary</h3>
				<p>Total Items: {{ report.inventorySummary.totalItems }}</p>
				<table class="table">
					<thead>
						<tr>
							<th>Item Name</th>
							<th>Stock</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in report.inventorySummary.details" :key="item.id">
							<td>{{ item.name }}</td>
							<td>{{ item.stock }}</td>
						</tr>
					</tbody>
				</table>
				<p v-if="report.inventorySummary.totalItems === 0" class="no-data">
					No inventory items available.
				</p>
			</div>
			
		</div>
	</div>
</template>

<script>
import { generateWeeklyReport } from "@/methods";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
	name: "AdminPanel",
	data() {
		return {
			report: null, // Holds the weekly report data
			loading: false, // Indicates if the report is being loaded
			error: null, // Holds error messages
		};
	},
	methods: {
		async fetchWeeklyReport() {
			this.loading = true;
			this.error = null;

			try {
				this.report = await generateWeeklyReport();
			} catch (err) {
				this.error = "Failed to fetch the weekly report. Please try again.";
			} finally {
				this.loading = false;
			}
		},
		formatDate(timestamp) {
			if (!timestamp) return "N/A";
			return new Date(timestamp).toLocaleString();
		},
		async downloadPDF() {
			const doc = new jsPDF();

			// Add the logo
			const logoUrl = require('@/assets/logo.png'); // Adjust the path as necessary
			const img = new Image();
			img.src = logoUrl;
			
			img.onload = () => {
				// Draw the logo at the top
				doc.addImage(img, 'PNG', 10, 10, 40, 10); // (image, format, x, y, width, height)

				// Add the report title
				doc.setFontSize(18);
				doc.text("Weekly Report", 60, 20);

				// Add the report generation date
				const reportDate = `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
				doc.setFontSize(10);
				doc.text(reportDate, 60, 30);

				// Weekly Requests Section
				const weeklyRequests = this.report.weeklyRequests.details;
				doc.setFontSize(14);
				doc.text(`Weekly Requests (Total: ${this.report.weeklyRequests.total})`, 10, 50);

				if (weeklyRequests.length > 0) {
					doc.autoTable({
						startY: 60,
						head: [["Product Name", "Quantity", "Status", "Request Date"]],
						body: weeklyRequests.map((request) => [
							request.productName,
							request.quantity,
							request.status,
							this.formatDate(request.timestamp),
						]),
					});
				} else {
					doc.text("No requests made this week.", 10, 60);
				}

				// Inventory Summary Section
				const inventorySummary = this.report.inventorySummary.details;
				const inventoryStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70;
				doc.setFontSize(14);
				doc.text(
					`Inventory Summary (Total Items: ${this.report.inventorySummary.totalItems})`,
					10,
					inventoryStartY
				);

				if (inventorySummary.length > 0) {
					doc.autoTable({
						startY: inventoryStartY + 10,
						head: [["Item Name", "Stock"]],
						body: inventorySummary.map((item) => [item.name, item.stock]),
					});
				} else {
					doc.text("No inventory items available.", 10, inventoryStartY + 10);
				}

				// Save the PDF
				doc.save("Weekly_Report.pdf");
			};

			img.onerror = () => {
				console.error("Failed to load logo image.");
				alert("Error: Unable to load the logo.");
			};
		},
	
	},
	mounted() {
		this.fetchWeeklyReport();
	},
};
</script>

<style scoped>
.loading {
	text-align: center;
	font-size: 18px;
	color: #666;
	margin-bottom: 20px;
}

.no-data {
	text-align: center;
	color: #666;
	margin-top: 10px;
}
</style>
