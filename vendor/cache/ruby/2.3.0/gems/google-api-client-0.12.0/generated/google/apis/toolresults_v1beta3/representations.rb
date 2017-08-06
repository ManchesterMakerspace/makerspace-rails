# Copyright 2015 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require 'date'
require 'google/apis/core/base_service'
require 'google/apis/core/json_representation'
require 'google/apis/core/hashable'
require 'google/apis/errors'

module Google
  module Apis
    module ToolresultsV1beta3
      
      class Any
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class BasicPerfSampleSeries
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class BatchCreatePerfSamplesRequest
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class BatchCreatePerfSamplesResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class CpuInfo
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Duration
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Execution
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class FailureDetail
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class FileReference
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class History
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Image
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class InconclusiveDetail
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ListExecutionsResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ListHistoriesResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ListPerfSampleSeriesResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ListPerfSamplesResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ListStepThumbnailsResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ListStepsResponse
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class MemoryInfo
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Outcome
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class PerfEnvironment
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class PerfMetricsSummary
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class PerfSample
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class PerfSampleSeries
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ProjectSettings
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class PublishXunitXmlFilesRequest
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class SkippedDetail
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class StackTrace
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Status
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Step
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class StepDimensionValueEntry
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class StepLabelsEntry
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class SuccessDetail
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class TestCaseReference
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class TestExecutionStep
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class TestIssue
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class TestSuiteOverview
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class TestTiming
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Thumbnail
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Timestamp
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ToolExecution
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ToolExecutionStep
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ToolExitCode
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class ToolOutputReference
        class Representation < Google::Apis::Core::JsonRepresentation; end
      
        include Google::Apis::Core::JsonObjectSupport
      end
      
      class Any
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :type_url, as: 'typeUrl'
          property :value, :base64 => true, as: 'value'
        end
      end
      
      class BasicPerfSampleSeries
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :perf_metric_type, as: 'perfMetricType'
          property :perf_unit, as: 'perfUnit'
          property :sample_series_label, as: 'sampleSeriesLabel'
        end
      end
      
      class BatchCreatePerfSamplesRequest
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :perf_samples, as: 'perfSamples', class: Google::Apis::ToolresultsV1beta3::PerfSample, decorator: Google::Apis::ToolresultsV1beta3::PerfSample::Representation
      
        end
      end
      
      class BatchCreatePerfSamplesResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :perf_samples, as: 'perfSamples', class: Google::Apis::ToolresultsV1beta3::PerfSample, decorator: Google::Apis::ToolresultsV1beta3::PerfSample::Representation
      
        end
      end
      
      class CpuInfo
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :cpu_processor, as: 'cpuProcessor'
          property :cpu_speed_in_ghz, as: 'cpuSpeedInGhz'
          property :number_of_cores, as: 'numberOfCores'
        end
      end
      
      class Duration
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :nanos, as: 'nanos'
          property :seconds, :numeric_string => true, as: 'seconds'
        end
      end
      
      class Execution
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :completion_time, as: 'completionTime', class: Google::Apis::ToolresultsV1beta3::Timestamp, decorator: Google::Apis::ToolresultsV1beta3::Timestamp::Representation
      
          property :creation_time, as: 'creationTime', class: Google::Apis::ToolresultsV1beta3::Timestamp, decorator: Google::Apis::ToolresultsV1beta3::Timestamp::Representation
      
          property :execution_id, as: 'executionId'
          property :outcome, as: 'outcome', class: Google::Apis::ToolresultsV1beta3::Outcome, decorator: Google::Apis::ToolresultsV1beta3::Outcome::Representation
      
          property :state, as: 'state'
          property :test_execution_matrix_id, as: 'testExecutionMatrixId'
        end
      end
      
      class FailureDetail
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :crashed, as: 'crashed'
          property :not_installed, as: 'notInstalled'
          property :other_native_crash, as: 'otherNativeCrash'
          property :timed_out, as: 'timedOut'
          property :unable_to_crawl, as: 'unableToCrawl'
        end
      end
      
      class FileReference
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :file_uri, as: 'fileUri'
        end
      end
      
      class History
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :display_name, as: 'displayName'
          property :history_id, as: 'historyId'
          property :name, as: 'name'
        end
      end
      
      class Image
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :error, as: 'error', class: Google::Apis::ToolresultsV1beta3::Status, decorator: Google::Apis::ToolresultsV1beta3::Status::Representation
      
          property :source_image, as: 'sourceImage', class: Google::Apis::ToolresultsV1beta3::ToolOutputReference, decorator: Google::Apis::ToolresultsV1beta3::ToolOutputReference::Representation
      
          property :step_id, as: 'stepId'
          property :thumbnail, as: 'thumbnail', class: Google::Apis::ToolresultsV1beta3::Thumbnail, decorator: Google::Apis::ToolresultsV1beta3::Thumbnail::Representation
      
        end
      end
      
      class InconclusiveDetail
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :aborted_by_user, as: 'abortedByUser'
          property :infrastructure_failure, as: 'infrastructureFailure'
        end
      end
      
      class ListExecutionsResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :executions, as: 'executions', class: Google::Apis::ToolresultsV1beta3::Execution, decorator: Google::Apis::ToolresultsV1beta3::Execution::Representation
      
          property :next_page_token, as: 'nextPageToken'
        end
      end
      
      class ListHistoriesResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :histories, as: 'histories', class: Google::Apis::ToolresultsV1beta3::History, decorator: Google::Apis::ToolresultsV1beta3::History::Representation
      
          property :next_page_token, as: 'nextPageToken'
        end
      end
      
      class ListPerfSampleSeriesResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :perf_sample_series, as: 'perfSampleSeries', class: Google::Apis::ToolresultsV1beta3::PerfSampleSeries, decorator: Google::Apis::ToolresultsV1beta3::PerfSampleSeries::Representation
      
        end
      end
      
      class ListPerfSamplesResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :next_page_token, as: 'nextPageToken'
          collection :perf_samples, as: 'perfSamples', class: Google::Apis::ToolresultsV1beta3::PerfSample, decorator: Google::Apis::ToolresultsV1beta3::PerfSample::Representation
      
        end
      end
      
      class ListStepThumbnailsResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :next_page_token, as: 'nextPageToken'
          collection :thumbnails, as: 'thumbnails', class: Google::Apis::ToolresultsV1beta3::Image, decorator: Google::Apis::ToolresultsV1beta3::Image::Representation
      
        end
      end
      
      class ListStepsResponse
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :next_page_token, as: 'nextPageToken'
          collection :steps, as: 'steps', class: Google::Apis::ToolresultsV1beta3::Step, decorator: Google::Apis::ToolresultsV1beta3::Step::Representation
      
        end
      end
      
      class MemoryInfo
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :memory_cap_in_kibibyte, :numeric_string => true, as: 'memoryCapInKibibyte'
          property :memory_total_in_kibibyte, :numeric_string => true, as: 'memoryTotalInKibibyte'
        end
      end
      
      class Outcome
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :failure_detail, as: 'failureDetail', class: Google::Apis::ToolresultsV1beta3::FailureDetail, decorator: Google::Apis::ToolresultsV1beta3::FailureDetail::Representation
      
          property :inconclusive_detail, as: 'inconclusiveDetail', class: Google::Apis::ToolresultsV1beta3::InconclusiveDetail, decorator: Google::Apis::ToolresultsV1beta3::InconclusiveDetail::Representation
      
          property :skipped_detail, as: 'skippedDetail', class: Google::Apis::ToolresultsV1beta3::SkippedDetail, decorator: Google::Apis::ToolresultsV1beta3::SkippedDetail::Representation
      
          property :success_detail, as: 'successDetail', class: Google::Apis::ToolresultsV1beta3::SuccessDetail, decorator: Google::Apis::ToolresultsV1beta3::SuccessDetail::Representation
      
          property :summary, as: 'summary'
        end
      end
      
      class PerfEnvironment
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :cpu_info, as: 'cpuInfo', class: Google::Apis::ToolresultsV1beta3::CpuInfo, decorator: Google::Apis::ToolresultsV1beta3::CpuInfo::Representation
      
          property :memory_info, as: 'memoryInfo', class: Google::Apis::ToolresultsV1beta3::MemoryInfo, decorator: Google::Apis::ToolresultsV1beta3::MemoryInfo::Representation
      
        end
      end
      
      class PerfMetricsSummary
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :execution_id, as: 'executionId'
          property :history_id, as: 'historyId'
          property :perf_environment, as: 'perfEnvironment', class: Google::Apis::ToolresultsV1beta3::PerfEnvironment, decorator: Google::Apis::ToolresultsV1beta3::PerfEnvironment::Representation
      
          collection :perf_metrics, as: 'perfMetrics'
          property :project_id, as: 'projectId'
          property :step_id, as: 'stepId'
        end
      end
      
      class PerfSample
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :sample_time, as: 'sampleTime', class: Google::Apis::ToolresultsV1beta3::Timestamp, decorator: Google::Apis::ToolresultsV1beta3::Timestamp::Representation
      
          property :value, as: 'value'
        end
      end
      
      class PerfSampleSeries
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :basic_perf_sample_series, as: 'basicPerfSampleSeries', class: Google::Apis::ToolresultsV1beta3::BasicPerfSampleSeries, decorator: Google::Apis::ToolresultsV1beta3::BasicPerfSampleSeries::Representation
      
          property :execution_id, as: 'executionId'
          property :history_id, as: 'historyId'
          property :project_id, as: 'projectId'
          property :sample_series_id, as: 'sampleSeriesId'
          property :step_id, as: 'stepId'
        end
      end
      
      class ProjectSettings
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :default_bucket, as: 'defaultBucket'
          property :name, as: 'name'
        end
      end
      
      class PublishXunitXmlFilesRequest
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :xunit_xml_files, as: 'xunitXmlFiles', class: Google::Apis::ToolresultsV1beta3::FileReference, decorator: Google::Apis::ToolresultsV1beta3::FileReference::Representation
      
        end
      end
      
      class SkippedDetail
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :incompatible_app_version, as: 'incompatibleAppVersion'
          property :incompatible_architecture, as: 'incompatibleArchitecture'
          property :incompatible_device, as: 'incompatibleDevice'
        end
      end
      
      class StackTrace
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :exception, as: 'exception'
        end
      end
      
      class Status
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :code, as: 'code'
          collection :details, as: 'details', class: Google::Apis::ToolresultsV1beta3::Any, decorator: Google::Apis::ToolresultsV1beta3::Any::Representation
      
          property :message, as: 'message'
        end
      end
      
      class Step
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :completion_time, as: 'completionTime', class: Google::Apis::ToolresultsV1beta3::Timestamp, decorator: Google::Apis::ToolresultsV1beta3::Timestamp::Representation
      
          property :creation_time, as: 'creationTime', class: Google::Apis::ToolresultsV1beta3::Timestamp, decorator: Google::Apis::ToolresultsV1beta3::Timestamp::Representation
      
          property :description, as: 'description'
          property :device_usage_duration, as: 'deviceUsageDuration', class: Google::Apis::ToolresultsV1beta3::Duration, decorator: Google::Apis::ToolresultsV1beta3::Duration::Representation
      
          collection :dimension_value, as: 'dimensionValue', class: Google::Apis::ToolresultsV1beta3::StepDimensionValueEntry, decorator: Google::Apis::ToolresultsV1beta3::StepDimensionValueEntry::Representation
      
          property :has_images, as: 'hasImages'
          collection :labels, as: 'labels', class: Google::Apis::ToolresultsV1beta3::StepLabelsEntry, decorator: Google::Apis::ToolresultsV1beta3::StepLabelsEntry::Representation
      
          property :name, as: 'name'
          property :outcome, as: 'outcome', class: Google::Apis::ToolresultsV1beta3::Outcome, decorator: Google::Apis::ToolresultsV1beta3::Outcome::Representation
      
          property :run_duration, as: 'runDuration', class: Google::Apis::ToolresultsV1beta3::Duration, decorator: Google::Apis::ToolresultsV1beta3::Duration::Representation
      
          property :state, as: 'state'
          property :step_id, as: 'stepId'
          property :test_execution_step, as: 'testExecutionStep', class: Google::Apis::ToolresultsV1beta3::TestExecutionStep, decorator: Google::Apis::ToolresultsV1beta3::TestExecutionStep::Representation
      
          property :tool_execution_step, as: 'toolExecutionStep', class: Google::Apis::ToolresultsV1beta3::ToolExecutionStep, decorator: Google::Apis::ToolresultsV1beta3::ToolExecutionStep::Representation
      
        end
      end
      
      class StepDimensionValueEntry
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :key, as: 'key'
          property :value, as: 'value'
        end
      end
      
      class StepLabelsEntry
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :key, as: 'key'
          property :value, as: 'value'
        end
      end
      
      class SuccessDetail
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :other_native_crash, as: 'otherNativeCrash'
        end
      end
      
      class TestCaseReference
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :class_name, as: 'className'
          property :name, as: 'name'
          property :test_suite_name, as: 'testSuiteName'
        end
      end
      
      class TestExecutionStep
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :test_issues, as: 'testIssues', class: Google::Apis::ToolresultsV1beta3::TestIssue, decorator: Google::Apis::ToolresultsV1beta3::TestIssue::Representation
      
          collection :test_suite_overviews, as: 'testSuiteOverviews', class: Google::Apis::ToolresultsV1beta3::TestSuiteOverview, decorator: Google::Apis::ToolresultsV1beta3::TestSuiteOverview::Representation
      
          property :test_timing, as: 'testTiming', class: Google::Apis::ToolresultsV1beta3::TestTiming, decorator: Google::Apis::ToolresultsV1beta3::TestTiming::Representation
      
          property :tool_execution, as: 'toolExecution', class: Google::Apis::ToolresultsV1beta3::ToolExecution, decorator: Google::Apis::ToolresultsV1beta3::ToolExecution::Representation
      
        end
      end
      
      class TestIssue
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :error_message, as: 'errorMessage'
          property :stack_trace, as: 'stackTrace', class: Google::Apis::ToolresultsV1beta3::StackTrace, decorator: Google::Apis::ToolresultsV1beta3::StackTrace::Representation
      
        end
      end
      
      class TestSuiteOverview
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :error_count, as: 'errorCount'
          property :failure_count, as: 'failureCount'
          property :name, as: 'name'
          property :skipped_count, as: 'skippedCount'
          property :total_count, as: 'totalCount'
          property :xml_source, as: 'xmlSource', class: Google::Apis::ToolresultsV1beta3::FileReference, decorator: Google::Apis::ToolresultsV1beta3::FileReference::Representation
      
        end
      end
      
      class TestTiming
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :test_process_duration, as: 'testProcessDuration', class: Google::Apis::ToolresultsV1beta3::Duration, decorator: Google::Apis::ToolresultsV1beta3::Duration::Representation
      
        end
      end
      
      class Thumbnail
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :content_type, as: 'contentType'
          property :data, :base64 => true, as: 'data'
          property :height_px, as: 'heightPx'
          property :width_px, as: 'widthPx'
        end
      end
      
      class Timestamp
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :nanos, as: 'nanos'
          property :seconds, :numeric_string => true, as: 'seconds'
        end
      end
      
      class ToolExecution
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          collection :command_line_arguments, as: 'commandLineArguments'
          property :exit_code, as: 'exitCode', class: Google::Apis::ToolresultsV1beta3::ToolExitCode, decorator: Google::Apis::ToolresultsV1beta3::ToolExitCode::Representation
      
          collection :tool_logs, as: 'toolLogs', class: Google::Apis::ToolresultsV1beta3::FileReference, decorator: Google::Apis::ToolresultsV1beta3::FileReference::Representation
      
          collection :tool_outputs, as: 'toolOutputs', class: Google::Apis::ToolresultsV1beta3::ToolOutputReference, decorator: Google::Apis::ToolresultsV1beta3::ToolOutputReference::Representation
      
        end
      end
      
      class ToolExecutionStep
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :tool_execution, as: 'toolExecution', class: Google::Apis::ToolresultsV1beta3::ToolExecution, decorator: Google::Apis::ToolresultsV1beta3::ToolExecution::Representation
      
        end
      end
      
      class ToolExitCode
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :number, as: 'number'
        end
      end
      
      class ToolOutputReference
        # @private
        class Representation < Google::Apis::Core::JsonRepresentation
          property :creation_time, as: 'creationTime', class: Google::Apis::ToolresultsV1beta3::Timestamp, decorator: Google::Apis::ToolresultsV1beta3::Timestamp::Representation
      
          property :output, as: 'output', class: Google::Apis::ToolresultsV1beta3::FileReference, decorator: Google::Apis::ToolresultsV1beta3::FileReference::Representation
      
          property :test_case, as: 'testCase', class: Google::Apis::ToolresultsV1beta3::TestCaseReference, decorator: Google::Apis::ToolresultsV1beta3::TestCaseReference::Representation
      
        end
      end
    end
  end
end
