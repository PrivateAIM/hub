{{/*
Expand the name of the chart.
*/}}
{{- define "hub-client-ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "hub-client-ui.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "hub-client-ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "hub-client-ui.labels" -}}
helm.sh/chart: {{ include "hub-client-ui.chart" . }}
{{ include "hub-client-ui.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "hub-client-ui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hub-client-ui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "hub-client-ui.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "hub-client-ui.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
core publicURL
*/}}
{{- define "core.publicURL" -}}
{{- if .Values.core.hostname }}
http://{{- .Values.core.hostname }}
{{- else }}
http://{{ .Values.global.hub.hostname }}/core/
{{- end }}
{{- end }}

{{/*
storage publicURL
*/}}
{{- define "storage.publicURL" -}}
{{- if .Values.storage.hostname }}
http://{{- .Values.storage.hostname }}
{{- else }}
http://{{ .Values.global.hub.hostname }}/storage/
{{- end }}
{{- end }}

{{/*
authup publicURL
*/}}
{{- define "authup.publicURL" -}}
{{- if .Values.authup.hostname }}
http://{{- .Values.authup.hostname }}
{{- else }}
http://{{ .Values.global.hub.hostname }}/auth/
{{- end }}
{{- end }}
